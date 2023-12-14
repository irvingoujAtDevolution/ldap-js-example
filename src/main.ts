import init, {
  AuthenticationProtocol,
  JsLdapSearchScope,
  LdapSession,
  LdapSessionParameters,
  LoggingLevel,
  SspiAuthMethod,
  set_logging_level,
} from "@devolutions/ldap-wasm-js";

async function main() {
  let res = await init();
  console.log(res);
  set_logging_level(LoggingLevel.Info);

  let sessionParam = new LdapSessionParameters(
    "ws://localhost:7171/jet/fwd/tcp/fb328630-66b3-4b16-ac66-ed9e16fa5469?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkFTU09DSUFUSU9OIn0NCg.eyJpYXQiOjE2OTk2NDQ3MDIsIm5iZiI6MTY5OTY0NDcwMiwiZXhwIjoxNzAwMjQ5NTAxLCJqdGkiOiIzZjlkNGM0NS1mMzE3LTQxZDUtOTE0Yy0wMzNlMDJmM2Q2NGYiLCJqZXRfYXAiOiJsZGFwIiwiamV0X2NtIjoiZndkIiwiamV0X2FpZCI6ImZiMzI4NjMwLTY2YjMtNGIxNi1hYzY2LWVkOWUxNmZhNTQ2OSIsImRzdF9oc3QiOiJ0Y3A6Ly9JVC1IRUxQLURDLmFkLml0LWhlbHAubmluamE6Mzg5In0NCg.pXYJsX2PtJV9-zkPEuU5lgdxWvx2cncakiO4yNyEf5ts6QSuhgh_lmAewrZHc86zI-5xJdDiBmB_aou7JycNBPtyD26WiWjCf43RJR25vO165dZ5fNCjy-2eBv-AZPu8SG8xFTuvWmjNmR2AhVazBtV9bnqxHtZEJCRKwbQ1Qgn0vB9uz-lKrlhp55ykdBzaiLThdc7gU5w-B1iFZuqxfFXolenzUEEPFOwfAmsH7bpjlpFp1Uid0nJTWW7bQWYrW40a7UkcXdpmgKQhsLKyJZgdZnCQz9bRQcMN1NQfA5CA-6hDja3BDEm1LKsklTHrNqzPXeGKEGBGRmhzHG-KPw"
  );
  let session = await LdapSession.connect(sessionParam);

  const kdc_proxyy_url =
    "http://localhost:7171/jet/KdcProxy/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IktEQyJ9.eyJleHAiOjE3MDI1ODg4OTQsImp0aSI6IjkzZWJmNmNkLTA4N2MtNDU5YS1hM2M3LTI3MWVjMjMyZmMwNCIsImtyYl9rZGMiOiJ0Y3A6Ly9JVC1IRUxQLURDLmFkLml0LWhlbHAubmluamE6ODgiLCJrcmJfcmVhbG0iOiJhZC5pdC1oZWxwLm5pbmphIiwibmJmIjoxNzAyNTg3OTk0fQ.bNypuOFqXCxVjE5XDIjs6aPedFHrAgogNMMc4VOZfgHjdauJ2Ouek30X7KpqA6jv9UWltNQ4xFcZqHHBVWApvadUgrSA7cQZ1pIRzWEc2JVS7_uHerlnR_y-huZwBf4FekLS4JF1_yB9LcWkY5LRPY_ddn55VT-l5FTqwGNvQJ7SkikeuY8YDYJrpYfjB0woMaIsMrYsIpWXpndhic6YfyvZ2Ez9BdOUUdh49gSm2CGjna6VaDMqFcijeS7BK4tTNrH3jdTtq952skso8E1sswc61atDMU5W5N5RjzhY7ICHdoEVDP0oGGOC_qFmmWqjuZc7UJ1Rj5WqHtlpUq6tJA";

  let auth: SspiAuthMethod = {
    negotiate: {
      domain: "ad.it-help.ninja",
      kdc_proxy_url: kdc_proxyy_url,
      server_computer_name: "IT-HELP-DC",
    },
  };

  let bind_res = await session.sasl_bind({
    username: "Administrator",
    password: "DevoLabs123!",
    auth_method: auth,
    use_ldaps: false,
    controls: undefined,
  });

  session.search(
    "dc=ad,dc=it-help,dc=ninja",
    "(&(objectClass=user)(objectCategory=person))",
    JsLdapSearchScope.Subtree,
    ["cn"],
    10,
    10
  ).on_message((msg:any) => {
    console.log(msg);
  });
}

main();
