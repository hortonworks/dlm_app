package com.hortonworks.dataplane.profilers.phoenix;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.hortonworks.dataplane.profilers.common.AtlasTypeRegistrar;
import org.apache.atlas.AtlasClient;
import org.apache.atlas.typesystem.TypesDef;
import org.apache.atlas.typesystem.types.AttributeDefinition;
import org.apache.atlas.typesystem.types.ClassType;
import org.apache.atlas.typesystem.types.DataTypes;
import org.apache.atlas.typesystem.types.EnumTypeDefinition;
import org.apache.atlas.typesystem.types.HierarchicalTypeDefinition;
import org.apache.atlas.typesystem.types.Multiplicity;
import org.apache.atlas.typesystem.types.StructTypeDefinition;
import org.apache.atlas.typesystem.types.TraitType;
import org.apache.atlas.typesystem.types.utils.TypesUtil;

import java.util.List;

public class PhoenixTypeRegistrar extends AtlasTypeRegistrar {

    public PhoenixTypeRegistrar(AtlasClient atlasClient) {
        super(atlasClient);
    }

    @Override
    protected TypesDef createNewTypesDef(List<String> existingTypes) {
        TypesDef phoenixTypes = null;
        System.out.println("Creating Phoenix types");
        if (!existingTypes.contains(PHOENIX_TABLE_TYPE)) {
            HierarchicalTypeDefinition<ClassType> columnType =
                    TypesUtil.createClassTypeDef(PHOENIX_COLUMN_TYPE, ImmutableSet.of(AtlasClient.REFERENCEABLE_SUPER_TYPE, AtlasClient.ASSET_TYPE),
                            new AttributeDefinition(PHOENIX_COLUMN_DATA_TYPE, DataTypes.STRING_TYPE.getName(), Multiplicity.REQUIRED, false, null),
                            new AttributeDefinition(PHOENIX_COLUMN_FAMILY_DATA_TYPE, DataTypes.STRING_TYPE.getName(), Multiplicity.REQUIRED, false, null));
            HierarchicalTypeDefinition<ClassType> tableType =
                    TypesUtil.createClassTypeDef(PHOENIX_TABLE_TYPE, ImmutableSet.of(AtlasClient.DATA_SET_SUPER_TYPE),
                            new AttributeDefinition(PHOENIX_TABLE_ATTRIBUTE_COLUMNS, DataTypes.arrayTypeName(PHOENIX_COLUMN_TYPE), Multiplicity.COLLECTION, true, null));

            phoenixTypes = TypesUtil.getTypesDef(ImmutableList.<EnumTypeDefinition>of(), ImmutableList.<StructTypeDefinition>of(),
                    ImmutableList.<HierarchicalTypeDefinition<TraitType>>of(),
                    ImmutableList.of(columnType, tableType));
        }
        return phoenixTypes;
    }
}
