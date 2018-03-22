
ALTER TABLE dataplane.data_asset
  ADD COLUMN state VARCHAR(32) NOT NULL DEFAULT 'Edit',
  ADD COLUMN edit_flag VARCHAR(32)  NOT NULL DEFAULT 'Mark_Add',
  ADD CONSTRAINT unique_guid_and_dataset_id_constraint UNIQUE (guid, dataset_id),
  ADD CHECK (state IN ('Active','Edit')),
  ADD CHECK (edit_flag IN ('Mark_Add','Mark_Delete'));
