import init, {
  JsLdapSearchScope,
  LdapSession,
  LdapSessionParameters,
  LoggingLevel,
  SearchMessage,
  set_logging_level,
} from "@devolutions/ldap-wasm-js";

async function main() {
  let res = await init();
  set_logging_level(LoggingLevel.Info);



  let sessionParam = new LdapSessionParameters(
    "ws://localhost:7171/jet/fwd/tcp/fb328630-66b3-4b16-ac66-ed9e16fa5469?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkFTU09DSUFUSU9OIn0NCg.eyJpYXQiOjE2OTk2NDQ3MDIsIm5iZiI6MTY5OTY0NDcwMiwiZXhwIjoxNzAwMjQ5NTAxLCJqdGkiOiIzZjlkNGM0NS1mMzE3LTQxZDUtOTE0Yy0wMzNlMDJmM2Q2NGYiLCJqZXRfYXAiOiJsZGFwIiwiamV0X2NtIjoiZndkIiwiamV0X2FpZCI6ImZiMzI4NjMwLTY2YjMtNGIxNi1hYzY2LWVkOWUxNmZhNTQ2OSIsImRzdF9oc3QiOiJ0Y3A6Ly9JVC1IRUxQLURDLmFkLml0LWhlbHAubmluamE6Mzg5In0NCg.pXYJsX2PtJV9-zkPEuU5lgdxWvx2cncakiO4yNyEf5ts6QSuhgh_lmAewrZHc86zI-5xJdDiBmB_aou7JycNBPtyD26WiWjCf43RJR25vO165dZ5fNCjy-2eBv-AZPu8SG8xFTuvWmjNmR2AhVazBtV9bnqxHtZEJCRKwbQ1Qgn0vB9uz-lKrlhp55ykdBzaiLThdc7gU5w-B1iFZuqxfFXolenzUEEPFOwfAmsH7bpjlpFp1Uid0nJTWW7bQWYrW40a7UkcXdpmgKQhsLKyJZgdZnCQz9bRQcMN1NQfA5CA-6hDja3BDEm1LKsklTHrNqzPXeGKEGBGRmhzHG-KPw",
  );
  let session = await LdapSession.connect(sessionParam);
  let bind_res = await session.bind(
    "CN=Administrator,CN=Users,DC=ad,DC=it-help,DC=ninja",
    "DevoLabs123!",
  );
  console.log(bind_res);
  session.search(
    "CN=Users,DC=ad,DC=it-help,DC=ninja",
    "(userAccountControl:1.2.840.113556.1.4.803:=2)", // <== Extensible Match Filter
    JsLdapSearchScope.Subtree,
    [],
    100,
    100,
    [{
      server_sort: {
        sort_requests: [
          {
            attribute_name: "cn",
            ordering_rule: undefined,
            reverse_order: false,
          },
        ]
      }
    }]
  ).on_message((msg: SearchMessage) => {
    console.log(msg);
    if ("search_done" in msg.op) {
      console.log(msg.ctrl![0]) // <== should be server_sort_response, if server supports it and successful
    }
  })
}


main();

