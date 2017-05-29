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

/api/asset-query
- queries to find assets
- recieves an array of _filters_
- need more examples?
- name contains string pattern


