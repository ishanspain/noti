import http from 'node:http';

const options = {
  method: 'POST',
  hostname: 'control.msg91.com',
  port: null,
  path: '/api/v5/flow',
  headers: {
    accept: 'application/json',
    authkey: '',
    'content-type': 'application/json'
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write('{\n  "template_id": "EnterSMStemplateID", \n  "short_url": "1 (On) or 0 (Off)",\n  "short_url_expiry": "Seconds (Optional)",\n  "realTimeResponse": "1 (Optional)", \n  "recipients": [\n    {\n      "mobiles": "919XXXXXXXXX",\n      "VAR1": "VALUE 1",\n      "VAR2": "VALUE 2"\n    },\n    {\n      "mobiles": "919XXXXXXXXX",\n      "VAR1": "VALUE 1",\n      "VAR2": "VALUE 2"\n    },\n    {\n      "mobiles": "919XXXXXXXXX",\n      "VAR1": "VALUE 1",\n      "VAR2": "VALUE 2"\n    }\n    \n  ]\n}');
req.end();