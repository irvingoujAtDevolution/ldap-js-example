import init, {
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
  let uuid = "66334668-dcdf-4376-ab81-d07ea33fc848";
  let token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkFTU09DSUFUSU9OIn0NCg.eyJpYXQiOjE3MDI2NTIzMjgsIm5iZiI6MTcwMjY1MjMyOCwiZXhwIjoxNzAzMjU3MTI4LCJqdGkiOiI0MmNhOWFhYS1jMWE3LTRlZmItODUzZi04OGZkY2I0YmU2MTkiLCJqZXRfYXAiOiJsZGFwcyIsImpldF9jbSI6ImZ3ZCIsImpldF9haWQiOiI2NjMzNDY2OC1kY2RmLTQzNzYtYWI4MS1kMDdlYTMzZmM4NDgiLCJkc3RfaHN0IjoidGNwOi8vSVQtSEVMUC1EQy5hZC5pdC1oZWxwLm5pbmphOjYzNiJ9DQo.X_xbG5hOt4WBdROh4dbldLV6Pa2UC3mOzxUAEI5NiPzTE0QxBjIva0dHRRRG1gK3FFGQaJf9buhiTbWbhmOvDnInOE7U193p0qgMCKNN2RHcuaGymnMG-O3zRuGXhNgCHArIdM4xOdjloj1_nzogeBc195miGuaN4zhMGTTtobdLinLpx3-OVOeRiUV9B9xVqP_5NM90Q63GZcqIF8zXsMC2MrHM6AwxIV6IczYqDBRYXZo9zitx1Fzud10A9Eg6UlHmI15Lq3GCuHoAcaTI8OhCriR0VmFGsF1E9U_ILZUv7QPj9mNYxoVxSoS9vmywKChD6xbRp-4UgETw7wQ7iA"

  let sessionParam = new LdapSessionParameters(
    `ws://localhost:7171/jet/fwd/tls/${uuid}?token=${token}`
  );
  let session = await LdapSession.connect(sessionParam);

  const kdc_proxyy_url =
    "http://localhost:7171/jet/KdcProxy/eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IktEQyJ9.eyJleHAiOjE3MDI1ODg4OTQsImp0aSI6IjkzZWJmNmNkLTA4N2MtNDU5YS1hM2M3LTI3MWVjMjMyZmMwNCIsImtyYl9rZGMiOiJ0Y3A6Ly9JVC1IRUxQLURDLmFkLml0LWhlbHAubmluamE6ODgiLCJrcmJfcmVhbG0iOiJhZC5pdC1oZWxwLm5pbmphIiwibmJmIjoxNzAyNTg3OTk0fQ.bNypuOFqXCxVjE5XDIjs6aPedFHrAgogNMMc4VOZfgHjdauJ2Ouek30X7KpqA6jv9UWltNQ4xFcZqHHBVWApvadUgrSA7cQZ1pIRzWEc2JVS7_uHerlnR_y-huZwBf4FekLS4JF1_yB9LcWkY5LRPY_ddn55VT-l5FTqwGNvQJ7SkikeuY8YDYJrpYfjB0woMaIsMrYsIpWXpndhic6YfyvZ2Ez9BdOUUdh49gSm2CGjna6VaDMqFcijeS7BK4tTNrH3jdTtq952skso8E1sswc61atDMU5W5N5RjzhY7ICHdoEVDP0oGGOC_qFmmWqjuZc7UJ1Rj5WqHtlpUq6tJA";

  let auth: SspiAuthMethod = {
    negotiate: {
      domain: "ad.it-help.ninja",
      kdc_proxy_url: kdc_proxyy_url,
      server_computer_name: "IT-HELP-DC.ad.it-help.ninja",
    },
  };
  let bind_res = await session.sasl_bind({
    username: "Administrator",
    password: "DevoLabs123!",
    auth_method: auth,
    controls: undefined,
  });
  console.log(bind_res);

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
