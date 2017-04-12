export class AtlasLineage {
    requestId: string;
    results: {
        jsonClass: string;
        typeName: string;
        values: {
            vertices: {
                [key: string]: {
                    jsonClass: string;
                    typeName: string;
                    values: {
                        qualifiedName: string;
                        vertexId: {
                            jsonClass: string;
                            typeName: string;
                            values: {
                                guid: string;
                                state: string;
                                typeName: string;
                            }
                        }
                    }
                }
            },
            edges: {
                [key: string]: string[]
            }
        }
    };
}