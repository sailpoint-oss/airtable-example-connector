import { Collaborator, Attachment } from "airtable";

export class Util {
    public static ensureString(data: string | number | boolean | Collaborator | readonly Collaborator[] | readonly string[] | readonly Attachment[] | undefined): string {
        if (typeof data == 'string') {
            return data;
        } else {
            return ''
        }
    }

    public static stringToBoolean(data: string) {
        if (data.toUpperCase() == 'FALSE') {
            return false
        } else {
            return true
        }
    }

    public static ensureAttribute(attribute: any): string {
        if (attribute !== undefined && attribute !== null) {
            if (typeof attribute == 'string') {
                return attribute;
            } else {
                return ''
            }
        } else {
            return ''
        }
    }
}
