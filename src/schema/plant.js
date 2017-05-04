
console.log('call plant');
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInterfaceType } from 'graphql'
import {SPFObjType} from './spfobj'
console.log('plant',SPFObjType);
export const PlantType = new GraphQLObjectType({
  name: 'PlantType',
  interfaces:[SPFObjType],
  fields: {
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
    defaultvault:{
      type: GraphQLString,
      resolve(){return "new vault"}
    }
  },
  //this functionality is required, or the interface need to implement resolveType method
  isTypeOf:(value)=>true
})