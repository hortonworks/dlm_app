package models


sealed trait SortOrder {
  def name: String
}

case object ASCEND extends SortOrder {
  val name = "asc"
}

case object DESCEND extends SortOrder {
  val name = "desc"
}
