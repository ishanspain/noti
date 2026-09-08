import {
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetGroupPolicyCommand,
  GetUserCommand,
  GetUserPolicyCommand,
  IAMClient,
  ListAttachedGroupPoliciesCommand,
  ListAttachedUserPoliciesCommand,
  ListGroupsForUserCommand,
  ListGroupPoliciesCommand,
  ListUserPoliciesCommand,
} from "@aws-sdk/client-iam";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { fileURLToPath } from "node:url";

process.loadEnvFile(fileURLToPath(new URL("../../.env", import.meta.url)));

const region = process.env.AWS_APPSINVO_REGION;
const accessKeyId = process.env.AWS_APPSINVO_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_APPSINVO_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing AWS_APPSINVO_REGION, AWS_APPSINVO_ACCESS_KEY_ID, or AWS_APPSINVO_SECRET_ACCESS_KEY.");
}

const credentials = { accessKeyId, secretAccessKey };
const iam = new IAMClient({ region, credentials });
const sts = new STSClient({ region, credentials });

type PolicyStatement = {
  Effect?: string;
  Action?: string | string[];
  NotAction?: string | string[];
  Condition?: unknown;
};

function parsePolicy(document: string): { Statement?: PolicyStatement | PolicyStatement[] } {
  return JSON.parse(decodeURIComponent(document));
}

function actions(statement: PolicyStatement) {
  const value = statement.Action ?? statement.NotAction;
  const list = Array.isArray(value) ? value : value ? [value] : ["<no action>"];
  return `${statement.NotAction ? "NOT " : ""}${list.join(", ")}`;
}

function reportPolicy(source: string, document?: string) {
  if (!document) return;
  const policy = parsePolicy(document);
  const statements = policy.Statement ? (Array.isArray(policy.Statement) ? policy.Statement : [policy.Statement]) : [];
  for (const statement of statements) {
    console.log({
      source,
      effect: statement.Effect ?? "Unknown",
      actions: actions(statement),
      hasConditions: Boolean(statement.Condition),
    });
  }
}

async function reportManagedPolicy(source: string, arn?: string) {
  if (!arn) return;
  const policy = await iam.send(new GetPolicyCommand({ PolicyArn: arn }));
  const versionId = policy.Policy?.DefaultVersionId;
  if (!versionId) return;
  const version = await iam.send(new GetPolicyVersionCommand({ PolicyArn: arn, VersionId: versionId }));
  reportPolicy(source, version.PolicyVersion?.Document);
}

async function inspectPolicies(userName: string) {
  const user = await iam.send(new GetUserCommand({ UserName: userName }));
  console.log({ userName, permissionBoundary: user.User?.PermissionsBoundary?.PermissionsBoundaryArn ?? null });

  const [attachedUsers, inlineUsers, groups] = await Promise.all([
    iam.send(new ListAttachedUserPoliciesCommand({ UserName: userName })),
    iam.send(new ListUserPoliciesCommand({ UserName: userName })),
    iam.send(new ListGroupsForUserCommand({ UserName: userName })),
  ]);

  for (const policy of attachedUsers.AttachedPolicies ?? []) {
    await reportManagedPolicy(`user managed policy: ${policy.PolicyName}`, policy.PolicyArn);
  }
  for (const policyName of inlineUsers.PolicyNames ?? []) {
    const policy = await iam.send(new GetUserPolicyCommand({ UserName: userName, PolicyName: policyName }));
    reportPolicy(`user inline policy: ${policyName}`, policy.PolicyDocument);
  }
  for (const group of groups.Groups ?? []) {
    const groupName = group.GroupName;
    if (!groupName) continue;
    console.log({ group: groupName });
    const [attached, inline] = await Promise.all([
      iam.send(new ListAttachedGroupPoliciesCommand({ GroupName: groupName })),
      iam.send(new ListGroupPoliciesCommand({ GroupName: groupName })),
    ]);
    for (const policy of attached.AttachedPolicies ?? []) {
      await reportManagedPolicy(`group ${groupName} managed policy: ${policy.PolicyName}`, policy.PolicyArn);
    }
    for (const policyName of inline.PolicyNames ?? []) {
      const policy = await iam.send(new GetGroupPolicyCommand({ GroupName: groupName, PolicyName: policyName }));
      reportPolicy(`group ${groupName} inline policy: ${policyName}`, policy.PolicyDocument);
    }
  }
}

try {
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  console.log({ account: identity.Account, arn: identity.Arn, userId: identity.UserId });
  const userName = identity.Arn?.match(/:user\/(.+)$/)?.[1];
  if (!userName) {
    throw new Error("The access key is not associated with an IAM user, so user-policy inspection is unavailable.");
  }
  await inspectPolicies(userName);
  console.log("Note: effective permissions may additionally be limited by an AWS Organizations SCP or resource-based policies.");
} catch (error) {
  const value = error as { name?: string; message?: string; $metadata?: { httpStatusCode?: number } };
  console.error("Could not inspect IAM permissions.", {
    status: value.$metadata?.httpStatusCode,
    code: value.name,
    message: value.message,
  });
  process.exitCode = 1;
}
