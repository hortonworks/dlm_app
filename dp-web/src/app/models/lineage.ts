export class Lineage {
  relations: any[] = [];
  guidEntityMap = {};

  static getData() {
    return {
      'baseEntityGuid': 'e99416c1-0f91-4eb1-ad70-01777cbd68a8',
      'lineageDirection': 'BOTH',
      'lineageDepth': 3,
      'guidEntityMap': {
        'a6aa1aaa-d381-4f66-8a1b-0a71509a4d1d': {
          'typeName': 'hive_table',
          'attributes': {
            'owner': 'hdfs',
            'qualifiedName': 'default.source@Atlas_Profiler_Patch',
            'name': 'source',
            'description': null
          },
          'guid': 'a6aa1aaa-d381-4f66-8a1b-0a71509a4d1d',
          'status': 'ACTIVE',
          'displayText': 'source',
          'classificationNames': []
        },
        'dc083af1-bf4e-454f-a879-6507466f5b2d': {
          'typeName': 'hive_process',
          'attributes': {
            'owner': null,
            'qualifiedName': 'default.destination@Atlas_Profiler_Patch:1494583233000',
            'name': 'create table destination as select * from source',
            'description': null
          },
          'guid': 'dc083af1-bf4e-454f-a879-6507466f5b2d',
          'status': 'ACTIVE',
          'displayText': 'create table destination as select * from source',
          'classificationNames': []
        },
        'e99416c1-0f91-4eb1-ad70-01777cbd68a8': {
          'typeName': 'hive_table',
          'attributes': {
            'owner': 'hdfs',
            'qualifiedName': 'default.destination@Atlas_Profiler_Patch',
            'name': 'destination',
            'description': null
          },
          'guid': 'e99416c1-0f91-4eb1-ad70-01777cbd68a8',
          'status': 'ACTIVE',
          'displayText': 'destination',
          'classificationNames': []
        }
      },
      'relations': [{
        'fromEntityId': 'dc083af1-bf4e-454f-a879-6507466f5b2d',
        'toEntityId': 'e99416c1-0f91-4eb1-ad70-01777cbd68a8'
      }, {'fromEntityId': 'a6aa1aaa-d381-4f66-8a1b-0a71509a4d1d', 'toEntityId': 'dc083af1-bf4e-454f-a879-6507466f5b2d'}]
    };
  }

}