package com.hortonworks.dataplane.profilers.hdfs;

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

public class HdfsTypeRegistrar extends AtlasTypeRegistrar {

    public static final String HDFS_FILE_ELEMENT_TYPE = "HdfsFileElement_v2";
    public static final String HDFS_FILE_TYPE = "HdfsFile_v2";
    public static final String HDFS_FILE_SET_TYPE = "HdfsFileSet_v2";

    public static final String URI_ATTRIBUTE = "uri";
    public static final String SIZE_ATTRIBUTE = "size";
    public static final String FORMAT_ATTRIBUTE = "format";
    public static final String MODIFICATION_TIME_STAMP_ATTRIBUTE = "modificationTimeStamp";
    public static final String ACCESS_TIME_STAMP_ATTRIBUTE = "accessTimeStamp";
    public static final String GROUP_ATTRIBUTE = "group";
    public static final String POSIX_ACLS_ATTRIBUTE = "posixAcls";
    public static final String FILE_SET_ELEMENTS_ATTRIBUTE = "fileSetElements";
    public static final String COUNT_ATTRIBUTE = "count";
    public static final String FILE_SET_TYPE_ATTRIBUTE = "fileSetType";
    public static final String FILE_SET_TYPE_DETAILS_ATTRIBUTE = "fileSetTypeDetails";
    public static final String FILE_SET_FEATURES_ATTRIBUTE = "fileSetFeatures";
    public static final String FORMAT_DETAILS_ATTRIBUTE = "formatDetails";
    public static final String FILE_SET_CONTENT_FEATURES_ATTRIBUTE = "fileSetContentFeatues";

    public HdfsTypeRegistrar(AtlasClient atlasClient) {
        super(atlasClient);
    }

    @Override
    protected TypesDef createNewTypesDef(List<String> existingTypes) {
        TypesDef hdfsTypes = null;
        System.out.println("Registering HDFS types");
        if (!existingTypes.contains(HDFS_FILE_ELEMENT_TYPE)) {
            HierarchicalTypeDefinition<ClassType> hdfsElement =
                    TypesUtil.createClassTypeDef(HDFS_FILE_ELEMENT_TYPE, ImmutableSet.of(AtlasClient.DATA_SET_SUPER_TYPE),
                            new AttributeDefinition(SIZE_ATTRIBUTE, DataTypes.INT_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(MODIFICATION_TIME_STAMP_ATTRIBUTE, DataTypes.DATE_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(ACCESS_TIME_STAMP_ATTRIBUTE, DataTypes.DATE_TYPE.getName(), Multiplicity.OPTIONAL, false, null)
                    );
            HierarchicalTypeDefinition<ClassType> hdfsFile =
                    TypesUtil.createClassTypeDef(HDFS_FILE_TYPE, ImmutableSet.of(HDFS_FILE_ELEMENT_TYPE),
                            new AttributeDefinition(URI_ATTRIBUTE, DataTypes.STRING_TYPE.getName(), Multiplicity.REQUIRED, false, null),
                            new AttributeDefinition(FORMAT_ATTRIBUTE, DataTypes.STRING_TYPE.getName(), Multiplicity.REQUIRED, false, null),
                            new AttributeDefinition(FORMAT_DETAILS_ATTRIBUTE, DataTypes.mapTypeName(DataTypes.STRING_TYPE, DataTypes.STRING_TYPE), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(GROUP_ATTRIBUTE, DataTypes.STRING_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(POSIX_ACLS_ATTRIBUTE, DataTypes.STRING_TYPE.getName(), Multiplicity.OPTIONAL, false, null)
                    );
            HierarchicalTypeDefinition<ClassType> hdfsFileSet =
                    TypesUtil.createClassTypeDef(HDFS_FILE_SET_TYPE, ImmutableSet.of(HDFS_FILE_ELEMENT_TYPE),
                            new AttributeDefinition(FILE_SET_ELEMENTS_ATTRIBUTE, DataTypes.arrayTypeName(HDFS_FILE_ELEMENT_TYPE), Multiplicity.COLLECTION, false, null),
                            new AttributeDefinition(COUNT_ATTRIBUTE, DataTypes.INT_TYPE.getName(), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(FILE_SET_TYPE_ATTRIBUTE, DataTypes.STRING_TYPE.getName(), Multiplicity.REQUIRED, false, null),
                            new AttributeDefinition(FILE_SET_TYPE_DETAILS_ATTRIBUTE, DataTypes.mapTypeName(DataTypes.STRING_TYPE, DataTypes.STRING_TYPE), Multiplicity.OPTIONAL, false, null),
                            new AttributeDefinition(FILE_SET_CONTENT_FEATURES_ATTRIBUTE, DataTypes.mapTypeName(DataTypes.STRING_TYPE, DataTypes.STRING_TYPE), Multiplicity.OPTIONAL, false, null)
                    );
            hdfsTypes = TypesUtil.getTypesDef(ImmutableList.<EnumTypeDefinition>of(), ImmutableList.<StructTypeDefinition>of(),
                    ImmutableList.<HierarchicalTypeDefinition<TraitType>>of(),
                    ImmutableList.of(hdfsElement, hdfsFile, hdfsFileSet));
        }
        return hdfsTypes;
    }

}
