import {Injectable} from '@angular/core';
import {AtlasLineage} from '../models/altas-lineage';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AtlasLineageService {

    constructor() {
        let atlasLineage = new AtlasLineage();
    }

    getInputData(): Observable<AtlasLineage> {
        let inputJson = {'requestId':'pool-2-thread-3 - a1164d42-1e3d-4f07-bdef-75fb877bae90', 'results': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__tempQueryResultStruct521', 'values': { 'vertices': { 'ec99da88-da06-4a5b-881e-572de117058a': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__tempQueryResultStruct520', 'values': { 'qualifiedName': 'default.sample@Vimal_Fenton_New', 'vertexId': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__IdType', 'values': { 'guid': 'ec99da88-da06-4a5b-881e-572de117058a', 'state': 'ACTIVE', 'typeName': 'hive_table'}}, 'name': 'sample'}}, 'b43ebc85-f940-42be-81b1-e413e94b36aa': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__tempQueryResultStruct520', 'values': { 'qualifiedName': 'default.new_ctas@Vimal_Fenton_New', 'vertexId': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__IdType', 'values': { 'guid': 'b43ebc85-f940-42be-81b1-e413e94b36aa', 'state': 'ACTIVE', 'typeName': 'hive_table'}}, 'name': 'new_ctas'}}}, 'edges': { 'add637be-dd41-4fb9-a2d4-52b965c5a43d': ['ec99da88-da06-4a5b-881e-572de117058a'], 'b43ebc85-f940-42be-81b1-e413e94b36aa': ['add637be-dd41-4fb9-a2d4-52b965c5a43d']}}}};
        // let inputJson = {'requestId':'pool-2-thread-7 - 2a454297-f9e8-4ae1-a29a-ebecd963e293','results':{'jsonClass':'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct','typeName':'__tempQueryResultStruct649','values':{'vertices':{'ec99da88-da06-4a5b-881e-572de117058a':{'jsonClass':'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct','typeName':'__tempQueryResultStruct648','values':{'qualifiedName':'default.sample@Vimal_Fenton_New','vertexId':{'jsonClass':'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct','typeName':'__IdType','values':{'guid':'ec99da88-da06-4a5b-881e-572de117058a','state':'ACTIVE','typeName':'hive_table'}},'name':'sample'}},'20197810-1f0c-40ba-90f5-33271cd3720a':{'jsonClass':'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct','typeName':'__tempQueryResultStruct648','values':{'qualifiedName':'default.tmp12@Vimal_Fenton_New','vertexId':{'jsonClass':'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct','typeName':'__IdType','values':{'guid':'20197810-1f0c-40ba-90f5-33271cd3720a','state':'ACTIVE','typeName':'hive_table'}},'name':'tmp12'}}},'edges':{'20197810-1f0c-40ba-90f5-33271cd3720a':['08e9dd99-0e35-46c9-b668-623e96ad05fb'],'08e9dd99-0e35-46c9-b668-623e96ad05fb':['ec99da88-da06-4a5b-881e-572de117058a']}}}};

        return Observable.create((observer: any) => {
            observer.next(Object.assign(new AtlasLineage(),inputJson));
            observer.complete();
        });
    }

    getOutputData(): Observable<AtlasLineage> {
        let outputJson = {'requestId':'pool-2-thread-8 - 70656ff1-5969-4089-a886-4f102297879c', 'results': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__tempQueryResultStruct527', 'values': { 'vertices': { '2987a424-5b09-4c3f-b704-325381823129': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__tempQueryResultStruct526', 'values': { 'qualifiedName': 'default.new_ctas_2@Vimal_Fenton_New', 'vertexId': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__IdType', 'values': { 'guid': '2987a424-5b09-4c3f-b704-325381823129', 'state': 'ACTIVE', 'typeName': 'hive_table'}}, 'name': 'new_ctas_2'}}, 'b43ebc85-f940-42be-81b1-e413e94b36aa': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__tempQueryResultStruct526', 'values': { 'qualifiedName': 'default.new_ctas@Vimal_Fenton_New', 'vertexId': { 'jsonClass': 'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct', 'typeName': '__IdType', 'values': { 'guid': 'b43ebc85-f940-42be-81b1-e413e94b36aa', 'state': 'ACTIVE', 'typeName': 'hive_table'}}, 'name': 'new_ctas'}}}, 'edges': { '011a344a-e048-4836-b991-f4bf6407d98a': ['2987a424-5b09-4c3f-b704-325381823129'], 'b43ebc85-f940-42be-81b1-e413e94b36aa': ['011a344a-e048-4836-b991-f4bf6407d98a']}}}};
        // let outputJson = {'requestId':'pool-2-thread-4 - c63da23d-b475-4fca-bc8b-8a2c73d40b9a','results':{'jsonClass':'org.apache.atlas.typesystem.json.InstanceSerialization$_Struct','typeName':'__tempQueryResultStruct655','values':{'vertices':{},'edges':{}}}};
        return Observable.create((observer: any) => {
            observer.next(Object.assign(new AtlasLineage(),outputJson));
            observer.complete();
        });
    }
}