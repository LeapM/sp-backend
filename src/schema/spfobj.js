import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLInterfaceType,
	GraphQLList,
	GraphQLNonNull
} from 'graphql'
let SPFObjType = new GraphQLInterfaceType({
	name: 'SPFObjType',
	fields: () => ({
		obid: { type: GraphQLString },
		objuid: { type: GraphQLString },
		objname: { type: GraphQLString },
		domainuid: { type: GraphQLString },
		objdefuid: { type: GraphQLString },
		config: { type: GraphQLString },
		creationdate: { type: GraphQLString },
		lastupdated: { type: GraphQLString },
		terminationdate: { type: GraphQLString },
		uniquekey: { type: GraphQLString },
		claimedtoconfigs: { type: GraphQLString },
		markedforremoval: { type: GraphQLString },
		description: { type: GraphQLString },
		spfrevstate: { type: GraphQLString },
		getProp:{
			type:GraphQLString,
			args:{
				propdefuid:{
					type:new GraphQLNonNull(GraphQLString)
				}
			}
		},
		relatedobjs: {
			type: new GraphQLList(SPFObjType),
			args: {
				reldefuid: {
					type: new GraphQLNonNull(GraphQLString)
				}
			}
		}
	})
});

export { SPFObjType };