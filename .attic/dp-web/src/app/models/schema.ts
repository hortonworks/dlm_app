/**
 * Created by rksv on 04/12/16.
 */
export class Schema {
    name:string;
    owner:string;
    type:string;
    tags:string[];

    public static getData(): Schema[] {
        let data: Schema[] = [];

        let schema1 = new Schema();
        schema1.name = 'SSN';
        schema1.owner = 'Rohit_ops';
        schema1.type = 'string';
        schema1.tags = ['PIG', 'ENC'];
        data.push(schema1);

        let schema2 = new Schema();
        schema2.name = 'Location';
        schema2.owner = 'Rohit_ops';
        schema2.type = 'string';
        schema2.tags = [];
        data.push(schema2);

        let schema3 = new Schema();
        schema3.name = 'Age';
        schema3.owner = 'Rohit_ops';
        schema3.type = 'string';
        schema3.tags = [];
        data.push(schema3);

        let schema4 = new Schema();
        schema4.name = 'Gender';
        schema4.owner = 'Rohit_ops';
        schema4.type = 'string';
        schema4.tags = ['HIVE'];
        data.push(schema4);

        return data;
    }

}