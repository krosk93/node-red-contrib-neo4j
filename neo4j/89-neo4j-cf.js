var neo4j = require("neo4j-driver").v1

module.exports = function(RED) {
  function Neo4jNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    var neourl = config.url;
    var neouser = config.user;
    var neopassword = config.password;
    var ctx = this;
    var driver = neo4j.driver(neourl, neo4j.auth.basic(neouser, neopassword));

    this.on('input', function(msg) {
      // If Config URL is empty and passed in within the msg use it.
      // This allows dynamic connectivity.
      if (msg.url){
        neourl = msg.url;
      }

      if (neourl){
        console.log(neourl);
        var query = config.query;
        // Override static query with dynamic
        if (msg.query){
            query=msg.query;
            // console.log("Cypher Query : " + query);
        }
        var session = driver.session();
        var results = [];
        var params = msg.payload;

        // Run a Cypher statement, reading the result in a streaming manner as records arrive:
        session
          .run(query, params)
          .subscribe({
            onNext: function (record) {
              results.push(record.toObject());
            },
            onCompleted: function () {
              session.close();
              msg.payload = results;
              node.send(msg);
            },
            onError: function (error) {
              console.log("[neo4j Error] " + error.toString());
            }
          });
      }else{
        node.error("Neo4j URL is Empty");
      }

    });

    this.on('close', function() {
      driver.close();
    })
  }
  RED.nodes.registerType("neo4j",Neo4jNode);
}
