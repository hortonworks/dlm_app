package domain


object API {

  val users = "/users"
  val roles = "/roles"
  val locations = "/locations"
  val dpClusters = "dp/clusters"
  val clusters = "/clusters"
  val datasets = "/datasets"
  val workspaces = "/workspaces"

  case class EntityNotFound() extends Throwable
  case class UpdateError() extends Throwable

}
