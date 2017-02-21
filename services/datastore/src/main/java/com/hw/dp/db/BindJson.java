package com.hw.dp.db;

import org.postgresql.util.PGobject;
import org.skife.jdbi.v2.SQLStatement;
import org.skife.jdbi.v2.sqlobject.Binder;
import org.skife.jdbi.v2.sqlobject.BinderFactory;
import org.skife.jdbi.v2.sqlobject.BindingAnnotation;

import java.lang.annotation.Annotation;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.sql.SQLException;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.PARAMETER})
@BindingAnnotation(BindJson.JsonBinderFactory.class)
public @interface BindJson {
  String value();

  class JsonBinderFactory implements BinderFactory {
    @Override
    public Binder build(Annotation annotation) {
      return (Binder<BindJson, String>) (q, bind, jsonString) -> {
        try {
          PGobject data = new PGobject();
          data.setType("jsonb");
          data.setValue(jsonString);
          q.bind(bind.value(), data);
        } catch (SQLException ex) {
          throw new IllegalStateException("Error Binding JSON",ex);
        }
      };
    }
  }
}
