import init, {
  JsLdapSearchScope,
  LdapParser,
  LdapSession,
  LdapSessionParameters,
  LoggingLevel,
  SearchEntry,
  SearchMessage,
  set_logging_level,
} from "@devolutions/ldap-wasm-js";

const base_dn = "DC=ad,DC=it-help,DC=ninja";

async function main() {
  await init();
  set_logging_level(LoggingLevel.Info);


  let sessionParam = new LdapSessionParameters(
    "ws://localhost:7171/jet/fwd/tcp/fb328630-66b3-4b16-ac66-ed9e16fa5469?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkFTU09DSUFUSU9OIn0NCg.eyJpYXQiOjE2OTk2NDQ3MDIsIm5iZiI6MTY5OTY0NDcwMiwiZXhwIjoxNzAwMjQ5NTAxLCJqdGkiOiIzZjlkNGM0NS1mMzE3LTQxZDUtOTE0Yy0wMzNlMDJmM2Q2NGYiLCJqZXRfYXAiOiJsZGFwIiwiamV0X2NtIjoiZndkIiwiamV0X2FpZCI6ImZiMzI4NjMwLTY2YjMtNGIxNi1hYzY2LWVkOWUxNmZhNTQ2OSIsImRzdF9oc3QiOiJ0Y3A6Ly9JVC1IRUxQLURDLmFkLml0LWhlbHAubmluamE6Mzg5In0NCg.pXYJsX2PtJV9-zkPEuU5lgdxWvx2cncakiO4yNyEf5ts6QSuhgh_lmAewrZHc86zI-5xJdDiBmB_aou7JycNBPtyD26WiWjCf43RJR25vO165dZ5fNCjy-2eBv-AZPu8SG8xFTuvWmjNmR2AhVazBtV9bnqxHtZEJCRKwbQ1Qgn0vB9uz-lKrlhp55ykdBzaiLThdc7gU5w-B1iFZuqxfFXolenzUEEPFOwfAmsH7bpjlpFp1Uid0nJTWW7bQWYrW40a7UkcXdpmgKQhsLKyJZgdZnCQz9bRQcMN1NQfA5CA-6hDja3BDEm1LKsklTHrNqzPXeGKEGBGRmhzHG-KPw",
  );
  let session = await LdapSession.connect(sessionParam);
  let bind_res = await ntlm_bind(session);
  console.log(bind_res)

  let res: SearchEntry[] = await new Promise(resolve => {
    let res: SearchEntry[] = [];
    search_users(session, (entry) => {
      let operation = entry.op;
      if ('search_entry' in operation) {
        let entry = operation.search_entry;
        res.push(entry)

      } else {
        console.log("no entry")
        console.log(operation)
        resolve(res)
      }
    })
  })
  // step 1: get a attribute
  let fist_entry = res[0];
  console.log(fist_entry)
  let random_attribute = fist_entry.attributes[Math.floor(Math.random() * fist_entry.attributes.length)]; // random attribute
  // step 2: get the name of the attribute
  let attribute_name = random_attribute.attribute_name;
  console.log(attribute_name)

  // step 3: parse the attribute name, from camel case to active directory entry case, for example whenCreated to When-Created
  // Note: you may need to tweak this function a bit for different cases, for example now the primaryGroupID is parsed as Primary-Group-I-D, but it should be Primary-Group-ID
  let parsed_attribute_name = parseAttributeName(attribute_name)
  console.log(parsed_attribute_name)

  // step 4: get the schema for the attribute, (i.e) retrieve the attributeSyntax and oMSyntax with a search for the parsed_attribute_name
  let attribute_syntax_entry = await retrive_schema_for_attribute(session, parsed_attribute_name)
  console.log(attribute_syntax_entry)

  // step 5: extract the attributeSyntax and oMSyntax from the schema
  if (attribute_syntax_entry === null) {
    console.log("no schema for attribute " + attribute_name)
    return
  }
  let attribute_syntax = attribute_syntax_entry!.attributes.filter(a => a.attribute_name === "attributeSyntax")[0].attribute_value;
  let omsyntax = attribute_syntax_entry!.attributes.filter(a => a.attribute_name === "oMSyntax")[0].attribute_value;

  // step 6: parse the attributeSyntax and oMSyntax as string, see the enum definition for the possible values
  // if you are certain about the type of the attribute, you can skip this step and call parse_value with the type directly
  let attr_syntax_str = LdapParser.parse_value("StringPrintable", attribute_syntax)[0] as string
  let omsyntax_str = LdapParser.parse_value("StringPrintable", omsyntax)[0] as string
  console.log(attr_syntax_str)
  console.log(omsyntax_str)

  // step 7: parse the original attribute value with the attributeSyntax and oMSyntax
  // see details about the corresponding syntax here: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/7cda533e-d7a4-4aec-a517-91d02ff4a1aa
  let parsed_attribute_value = LdapParser.parse_with_syntax_value(attr_syntax_str, omsyntax_str, random_attribute.attribute_value)
  //the parsed_attribute_value is an array of values of possible type 1. a Date, 2. a string, 3. a number, 4. a boolean, 5. a Uint8Array
  console.log("get attribute value for " + attribute_name)
  console.log(parsed_attribute_value)

  // Note: Not All attributes are supported properly at this point, you may experience some errors, let me know if you find any issue
}

const parseAttributeName = (name: string) => {
  // convert whenCreated to When-Created
  let result = "";
  for (let i = 0; i < name.length; i++) {
    let char = name[i];
    if (char === char.toUpperCase()) {
      result += "-" + char;
    } else {
      result += char;
    }
  }
  //capitalize first letter
  result = result[0].toUpperCase() + result.slice(1);
  return result;
}

const ntlm_bind = async (session: LdapSession) => {
  return await session.ntlm_bind(
    "Administrator@ad.it-help.ninja",
    "DevoLabs123!",
  );
}

const simple_bind = async (session: LdapSession) => {
  return await session.bind(
    "CN=Administrator,CN=Users,DC=ad,DC=it-help,DC=ninja",
    "DevoLabs123!",
  );
}

const search_users = (session: LdapSession, onMessage: (entry: SearchMessage) => void) => {
  // search for user
  const filter = `(objectClass=user)`;
  const scope = JsLdapSearchScope.Subtree;
  const size_limit = 5;
  const time_limit = 60;
  session.search(base_dn, filter, scope, [], size_limit, time_limit).on_message(onMessage)
}

const retrive_schema_for_attribute = async (session: LdapSession, attributeName: string): Promise<SearchEntry | null> => {
  const filter = `(cn=*${attributeName}*)`;
  const scope = JsLdapSearchScope.Subtree;
  const size_limit = 1;
  const time_limit = 60;
  const dn_schema = "CN=Schema,CN=Configuration,DC=ad,DC=it-help,DC=ninja"
  return new Promise(resolve => {
    let res: SearchEntry | null = null;
    session.search(dn_schema, filter, scope, ["cn", "attributeSyntax", "oMSyntax"], size_limit, time_limit).on_message((v: SearchMessage) => {
      let operation = v.op;
      if ('search_entry' in operation) {
        res = operation.search_entry;
      } else {
        resolve(res)
      }
    })
  })
}

const retrive_schema = async (session: LdapSession) => {
  const filter = '(cn=*Info*)';
  const scope = JsLdapSearchScope.Subtree;
  const size_limit = 5;
  const time_limit = 60;
  const dn_schema = "CN=Schema,CN=Configuration,DC=ad,DC=it-help,DC=ninja"
  session.search(dn_schema, filter, scope, ["cn", "attribyteSyntax", "oMSyntax"], size_limit, time_limit).on_message((v: SearchMessage) => {
    let operation = v.op;
    if ('search_entry' in operation) {
      let entry = operation.search_entry;
      let attributes_arr = entry.attributes;
      attributes_arr.forEach((a) => {
        let result = LdapParser.parse_value("StringPrintable", a.attribute_value)
        console.log(result)
      })
    } else {
      console.log("no entry")
      console.log(operation)
    }
  })
}


main();

