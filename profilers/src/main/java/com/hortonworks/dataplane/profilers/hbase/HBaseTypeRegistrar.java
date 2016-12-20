package com.hortonworks.dataplane.profilers.hbase;

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

public class HBaseTypeRegistrar extends AtlasTypeRegistrar {

    public HBaseTypeRegistrar(AtlasClient atlasClient) {
        super(atlasClient);
    }

    @Override
    protected TypesDef createNewTypesDef(List<String> existingTypes) {
        System.out.println("Creating HBase types");
        TypesDef hbaseTypes = null;
        if (!existingTypes.contains(HBASE_NAMESPACE_TYPE)) {
            HierarchicalTypeDefinition<ClassType> namespaceType =
                    TypesUtil.createClassTypeDef(HBASE_NAMESPACE_TYPE, ImmutableSet.of(AtlasClient.REFERENCEABLE_SUPER_TYPE, AtlasClient.ASSET_TYPE));
            HierarchicalTypeDefinition<ClassType> columnFamilyType =
                    TypesUtil.createClassTypeDef(HBASE_COLUMN_FAMILY_TYPE, ImmutableSet.of(AtlasClient.REFERENCEABLE_SUPER_TYPE, AtlasClient.ASSET_TYPE),
                            new AttributeDefinition(CF_ATTRIBUTE_VERSIONS, DataTypes.INT_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(CF_ATTRIBUTE_IN_MEMORY, DataTypes.BOOLEAN_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(CF_ATTRIBUTE_BLOCK_SIZE, DataTypes.INT_TYPE.getName(), Multiplicity.REQUIRED, false, null),
                            new AttributeDefinition(CF_ATTRIBUTE_COMPRESSION, DataTypes.STRING_TYPE.getName(), Multiplicity.OPTIONAL, false, null));
            HierarchicalTypeDefinition<ClassType> tableType =
                    // In older builds, there was no Asset type, and DataSet was not extending Asset. If used with those
                    // builds, we need to define both DataSet and Asset as supertypes.
                    TypesUtil.createClassTypeDef(HBASE_TABLE_TYPE, ImmutableSet.of(AtlasClient.DATA_SET_SUPER_TYPE),
                            new AttributeDefinition(TABLE_ATTRIBUTE_NAMESPACE, HBASE_NAMESPACE_TYPE, Multiplicity.REQUIRED, false, null),
                            new AttributeDefinition(TABLE_ATTRIBUTE_IS_ENABLED, DataTypes.BOOLEAN_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(TABLE_ATTRIBUTE_COLUMN_FAMILIES, DataTypes.arrayTypeName(HBASE_COLUMN_FAMILY_TYPE), Multiplicity.COLLECTION, true, null));
            hbaseTypes = TypesUtil.getTypesDef(ImmutableList.<EnumTypeDefinition>of(), ImmutableList.<StructTypeDefinition>of(),
                    ImmutableList.<HierarchicalTypeDefinition<TraitType>>of(),
                    ImmutableList.of(namespaceType, columnFamilyType, tableType));
        }
        return hbaseTypes;
    }


}
