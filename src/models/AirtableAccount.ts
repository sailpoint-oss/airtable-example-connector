import { AttributeChangeOp, SimpleKey, StdAccountCreateInput, StdAccountCreateOutput, StdAccountListOutput, StdAccountReadOutput, StdAccountUpdateOutput } from '@sailpoint/connector-sdk'
import { FieldSet, Record } from 'airtable'
import { Util } from './ModelUtils'

export class AirtableAccount {
    airtableId!: string
    displayName!: string
    email!: string
    id!: string
    department!: string
    firstName!: string
    lastName!: string
    enabled = true
    locked = false
    password!: string
    entitlments!: Array<string>


    public static createWithRecords(record: Record<FieldSet>): AirtableAccount {
        const account = new AirtableAccount();
        account.airtableId = record.id
        account.displayName = Util.ensureString(record.get('displayName'))
        account.email = Util.ensureString(record.get('email'))
        account.id = Util.ensureString(record.get('id'))
        account.department = Util.ensureString(record.get('department'))
        account.firstName = Util.ensureString(record.get('firstName'))
        account.lastName = Util.ensureString(record.get('lastName'))
        account.enabled = Util.ensureString(record.get('enabled')) == 'true' ? true : false
        account.locked = Util.ensureString(record.get('locked')) == 'true' ? true : false
        account.entitlments = Util.ensureString(record.get('entitlements')).split(',')

        return account;
    }

    public static createWithStdAccountCreateInput(record: StdAccountCreateInput): AirtableAccount {
        const account = new AirtableAccount();
        account.airtableId = ''
        account.displayName = Util.ensureAttribute(record.attributes['displayName'])
        account.email = Util.ensureAttribute(record.attributes['email'])
        account.id = Util.ensureAttribute(record.attributes['id'])
        account.department = Util.ensureAttribute(record.attributes['department'])
        account.firstName = Util.ensureAttribute(record.attributes['firstName'])
        account.lastName = Util.ensureAttribute(record.attributes['lastName'])
        account.enabled = Util.ensureAttribute(record.attributes['enabled']) == 'false' ? false : true
        account.locked = Util.ensureAttribute(record.attributes['locked']) == 'true' ? true : false
        account.password = Util.ensureAttribute(record.attributes['password'])
        if (record.attributes['entitlements'] != null) {
            if (!Array.isArray(record.attributes['entitlements'])) {
                account.entitlments = [record.attributes['entitlements']]
            } else {
                account.entitlments = record.attributes['entitlements']
            }
        } else {
            account.entitlments = []
        }

        return account;
    }

    public updateFieldByName(fieldname: string, value: string, operation: AttributeChangeOp ) {
        switch (fieldname) {
            case 'displayName':
                this.displayName = value
                break
            case 'email':
                this.email = value
                break
            case 'id':
                this.id = value
                break
            case 'department':
                this.department = value
                break
            case 'firstName':
                this.firstName = value
                break
            case 'lastName':
                this.lastName = value
                break
            case 'enabled':
                this.enabled = Util.stringToBoolean(value)
                break
            case 'locked':
                this.locked = Util.stringToBoolean(value)
                break
            case 'entitlements':
                if (operation == AttributeChangeOp.Add) {
                    this.entitlments.push(value)
                } else if (operation == AttributeChangeOp.Set) {
                    this.entitlments = []
                    this.entitlments.push(value)
                } else if (operation == AttributeChangeOp.Remove) {
                    this.entitlments = this.entitlments.filter(e => e !== value)
                }
                break
        }
    }

    public toStdAccountListOutput(): StdAccountListOutput {
        return this.buildStandardObject();
    }

    public toStdAccountReadOutput(): StdAccountReadOutput {
        return this.buildStandardObject();
    }

    public toStdAccountUpdateOutput(): StdAccountUpdateOutput {
        return this.buildStandardObject();
    }

    public toStdAccountCreateOutput(): StdAccountCreateOutput {
        return this.buildStandardObject();
    }

    private buildStandardObject(): StdAccountListOutput | StdAccountCreateOutput | StdAccountReadOutput | StdAccountListOutput {
        return {
            key: SimpleKey(this.id),
            attributes: {
                id: this.id,
                displayName: this.displayName,
                department: this.department,
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                enabled: this.enabled,
                locked: this.locked,
                entitlements: this.entitlments,
            },
        }
    }

    public toAirtableObject(): any {
        return {
                id: this.id,
                displayName: this.displayName,
                department: this.department,
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                enabled: this.enabled.toString(),
                locked: this.locked.toString(),
                entitlements: this.entitlments.join(","),
            }
        }
}
