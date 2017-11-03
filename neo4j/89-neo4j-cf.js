var neo4j = require("node-neo4j")

module.exports = function(RED) {
    function Neo4jNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        var neourl = config.url;
        var ctx = this;

        this.on('input', function(msg) {

            // If Config URL is empty and passed in within the msg use it.
            // This allows dynamic connectivity.
            if (msg.url){
                neourl = msg.url;
            }

            if (neourl){
                //console.log(neourl);
                var query = config.query;
                // Override static query with dynamic
                if (msg.query){
                    query=msg.query;
                    // console.log("Cypher Query : " + query);
                }

                try{
                    var params = msg.payload;
                    var db = new neo4j(neourl);
                    db.cypherQuery(query, params, function (err, results){
                        if (err) ctx.error(err);
                        msg.payload = results;
                        node.send(msg);
                    });
                }
                catch(exception){
                    console.log("[neo4j Exception] " + exception.toString());
                    node.error(exception.toString());
                }
            }else{
                node.error("Neo4j URL is Empty");
            }

        });
    }
    RED.nodes.registerType("neo4j",Neo4jNode);
}
