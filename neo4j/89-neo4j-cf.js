var neo4j = require("node-neo4j")

module.exports = function(RED) {
    function Neo4jNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        
        console.log(config.url);
        var db = new neo4j(config.url);
        var ctx = this;
        this.on('input', function(msg) {
        	var query = config.query;
            // Override static query with dynamic 
            if (msg.query){
                query=msg.query;
                console.log("Overriding Cypher Query : " + query);
            }
            var params = msg.payload;
            db.cypherQuery(query, params, function (err, results){
        		if (err) ctx.error(err);
                msg.payload = results;
        		node.send(msg);
        	});           
        });
    }
    RED.nodes.registerType("neo4j",Neo4jNode);
}
