import { LdapSession } from "@devolutions/ldap-wasm-js";

export const add_new_group = async (session: LdapSession, dn: string) => {


    // //generate grouptype int
    // var scopeValue;
    // // switch (event.groupScope) {
    // //     case 'Domain local':
    // //         scopeValue = 0x00000004
    // //         break;
    // //     case 'Global':
    // //         scopeValue = 0x00000002
    // //         break;
    // //     case 'Universal':
    // //         scopeValue = 0x00000008
    // //         break;
    // // }

    // // var typeValue;
    // // switch (event.groupType) {
    // //     case 'Security':
    // //         typeValue = 0x00000004
    // //         break;
    // //     case 'Distribution':
    // //         typeValue = 0x00000002
    // //         break;
    // // }

    var groupeTypeInt = 0x00000002

    const res = await session.add(dn, [
        {
            attribute_name: "objectClass",
            attribute_value: {
                type: "string",
                value: ["top", "group"],
            }
        },
        {
            attribute_name: "name",
            attribute_value: {
                type: "string",
                value: ["test"], //?
            }
        },
        {
            attribute_name: "sAMAccountName",
            attribute_value: {
                type: "string",
                value: ["test"], //?
            }
        },
        {
            attribute_name: "groupType",
            attribute_value: {
                type: "integer",
                value: [groupeTypeInt], //?
            }
        },
    ])

    console.log("add_res", res);
}