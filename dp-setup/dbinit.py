from pymongo import MongoClient

def connect():
	while True:
		try:
			connection = MongoClient("dp-database", 27017)
			print "Connected to Mongo"
			break
		except:
			print "Failed getting connection, retrying after 1 second"
			time.sleep(1)
	return connection

def setup_dpdb(conn):
	dp_db_name = "data_plane"
	db = conn[dp_db_name]
	db.add_user("dp_admin", "dp_admin_password", roles=[{'role': 'readWrite', 'db': dp_db_name}, {'role': 'dbAdmin','db': dp_db_name}])

def initialize():
	conn = connect()
	setup_dpdb(conn)
	print "Finished initialization"

if __name__ == "__main__":
	print "Starting initialization"
	initialize()