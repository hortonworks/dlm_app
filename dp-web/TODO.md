# Stuff to do

## TODO
Tasks
- [ ] Form validations
- [ ] Unit test cases
- [ ] Conditionally determine 1st flow and accordingly move users to auth setup / lake setup / dashboard
- [ ] Improve autocomplete
- [ ] Fix location source


## Services
/api/datasets
- returns list of datasets
- tags-include=hello,world
- tags-exclude=menlo,park


/api/datasets
POST
{
  "name":"my ds name",
  "description":"some description",
  "lakeId":3,
  "tags":["tag-1","tag-2","tag-new"],
  "query":{
    "filters":  [{
      "attribute":"asset.source",
      "attributeType": "string",
      "operator":"=",
      "operand":"hive"
    },{
      "attribute":"asset.name",
      "attributeType": "string",
      "operator":"contains",
      "operand":"searchText"     
   }]
  }
}

/api/datasets/:datasetId
GET
{
  "id": 1456,
  "name":"Dataset A",
  "lakeId": 3,
  "tags": ["tag-1"]
}

/api/data-assets?datasetId=1456
GET
[{
  "id": 34,
  "assettype": "hive",
  "assetlabel": "fghfhggahja",
  "assetguid": "esfsrg",
  "datasetid": 3
}]

/api/dataset-tags
- renamed from ~~/api/dataset-categories~~
- summary=true
- reserved tags >> all, favorites
- dataset-tags table (tagname)

/api/assets/:id ??? Asset360?
- atlas identifier for asset
- should be uniquely identifiable across lakes
- are datasets assets?
- do not store?

/api/query-assets
- queries to find assets
- recieves an array of _filters_
- need more examples?
- name contains string pattern
http://192.168.99.100:9009/cluster/1/atlas/hive/search
{
  "filters":  [{
    "attribute":"asset.source",
    "attributeType": "string",
    "operator":"=",
    "operand":"hive"
  },{
    "attribute":"asset.name",
    "attributeType": "string",
    "operator":"contains",
    "operand":"searchText"     
  }]
}

/api/query-attributes
- http://192.168.99.100:9009/cluster/1/atlas/hive/attributes


ADD DATASET

ADD DATASET TAG
- done

ADD DATA ASSET
- done

RETRIEVE ATLAS QUERY RESULT
- done

INSERT DATA ASSETS
- bulk query



TRANSACTIONS



/dataset-tags
- POST
- add a tag
[{
  "name": "tagA"
}, {
  "name":"tagB"
}]
{
  "name": "tagC"
}
