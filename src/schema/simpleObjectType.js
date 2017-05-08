
import {GraphQLObjectType, GraphQLString,GraphQLList, GraphQLNonNull} from 'graphql'
import {SPFObjType} from './spfobj'
export const SimpleObjectType = new GraphQLObjectType({
  name: 'SimpleObjectType',
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
    getProp:{
			type:GraphQLString,
			args:{
				propdefuid:{
					type:new GraphQLNonNull(GraphQLString)
				}
			} ,
			resolve(parent, {propdefuid}, context) {
        console.log(propdefuid);
				return parent.getPropVal(context, propdefuid)
					.then((data) => data)
					.catch(() => null);
			}
		},
		relatedobjs: {
			type: new GraphQLList(SPFObjType),
			args: {
				reldefuid: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve(parent, { reldefuid }, context) {
				return parent.getRelatedObj(context, reldefuid)
					.then((data) => data)
					.catch(() => null);
			}
		},
    status:{
      type: new GraphQLList(SPFObjType),
      resolve(parent,args,context){
        return parent.getRelatedObj(context,'SPFConfigurationConfigurationStatus')
        .then((data)=>data)
        .catch(()=>null);
      }
    }
  },
  //this functionality is required, or the interface need to implement resolveType method
  isTypeOf:(value)=>true
})