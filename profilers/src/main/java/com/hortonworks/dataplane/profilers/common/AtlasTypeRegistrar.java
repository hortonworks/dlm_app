package com.hortonworks.dataplane.profilers.common;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import org.apache.atlas.AtlasClient;
import org.apache.atlas.AtlasServiceException;
import org.apache.atlas.typesystem.TypesDef;
import org.apache.atlas.typesystem.json.TypesSerialization;
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

public abstract class AtlasTypeRegistrar implements AtlasTypeConstants {

    private final AtlasClient atlasClient;

    public AtlasTypeRegistrar(AtlasClient atlasClient) {
        this.atlasClient = atlasClient;
    }

    private void createNewTypes(List<String> existingTypes) throws AtlasServiceException {
        TypesDef newTypesDef = createNewTypesDef(existingTypes);
        if (newTypesDef == null) {
            System.out.println("New types are already registered... not registering again.");
        } else {
            addTypes(newTypesDef);
        }
    }

    protected abstract TypesDef createNewTypesDef(List<String> existingTypes);

    private void addTypes(TypesDef types) throws AtlasServiceException {
        String typesAsString = TypesSerialization.toJson(types);
        System.out.println(typesAsString);
        List<String> typesCreated = atlasClient.createType(types);
        for (String typeCreated : typesCreated) {
            System.out.println("TypeCreated: " + typeCreated);
        }
        printDelimiter();
    }

    private static void printDelimiter() {
        System.out.println("============================================");
    }

    public void registerTypes() throws AtlasServiceException {
        List<String> types = atlasClient.listTypes();
        createNewTypes(types);
    }
}
