package com.hortonworks.dataplane.profilers.common;

public class Asset {

    public static final String DEFAULT_OWNER = "admin";
    private final String name;
    private final String description;
    private final String owner;

    public Asset(String name, String description) {
        this(name, description, DEFAULT_OWNER);
    }

    public Asset(String name, String description, String owner) {
        this.name = name;
        this.description = description;
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getOwner() {
        return owner;
    }
}
