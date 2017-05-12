package models

/**
  * actions that can be performed on the policy
  */
sealed trait PolicyAction {
  def name: String
}

case object SCHEDULE extends PolicyAction { val name = "SCHEDULE" }

case object SUSPEND extends PolicyAction { val name = "SUSPEND" }

case object RESUME extends PolicyAction { val name = "RESUME" }

case object DELETE extends PolicyAction { val name = "DELETE" }
