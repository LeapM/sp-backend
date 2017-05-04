
import {GraphQLObjectType, GraphQLString,GraphQLList} from 'graphql'
import {SPFObjType} from './spfobj'
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
    status:{
      type: new GraphQLList(SPFObjType),
      resolve(data,args,context){
        return data.getRelatedObj(context,'SPFConfigurationConfigurationStatus')
        .then((data)=>data)
        .catch(()=>null);
      }
    }
  },
  //this functionality is required, or the interface need to implement resolveType method
  isTypeOf:(value)=>true
})