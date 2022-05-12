import { SimpleKey, StdEntitlementListOutput, StdEntitlementReadOutput } from "@sailpoint/connector-sdk";
import { FieldSet, Record } from "airtable";
import { Util } from "./ModelUtils";

export class AirtableEntitlement {
    id!: string;
    name!: string;

    constructor(record: Record<FieldSet>) {
        this.id = Util.ensureString(record.get('id'));
        this.name = Util.ensureString(record.get('name'));
    }

    public toStdEntitlementListOutput(): StdEntitlementListOutput {
        return this.buildStandardObject();
    }

    public toStdEntitlementReadOutput(): StdEntitlementReadOutput {
        return this.buildStandardObject();
    }

    private buildStandardObject(): StdEntitlementReadOutput | StdEntitlementListOutput {
        return {
            key: SimpleKey(this.id),
            type: 'group',
            attributes: {
                id: this.id,
                name: this.name
            }
        }
    }
}