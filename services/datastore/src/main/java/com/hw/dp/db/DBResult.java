package com.hw.dp.db;

import java.util.Collection;
import java.util.Optional;

final public class DBResult {

  private Boolean success = false;
  private Optional<Throwable> error = Optional.empty();
  private Optional<Collection<String>> results = Optional.empty();

  private DBResult(Boolean success) {
    this.success = success;
  }

  private DBResult(Collection<String> res) {
    this(true);
    results = Optional.of(res);
  }

  private DBResult(Throwable error) {
    this.error = Optional.of(error);
    this.success = false;
  }

  public static DBResult failure(Throwable error){
    return new DBResult(error);
  }

  public static DBResult from(Collection<String> results){
    DBResult dbResult = new DBResult(results);
    return dbResult;
  }

  public Boolean isSuccessful(){
    return this.success;
  }

  public static DBResult success() {
    return new DBResult(true);
  }

  public Throwable getError() {
    return error.get();
  }

  public Optional<Collection<String>> getResults() {
    return results;
  }
}
