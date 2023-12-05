import { LdapSession } from "@devolutions/ldap-wasm-js";

export const remove_dn = async (session: LdapSession, dn: string) => {
    const res = await session.delete(dn);
    console.log("res", res);
}