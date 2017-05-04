import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInterfaceType } from 'graphql'
import { SPFObj } from '../model'
import { SPFObjType } from './spfobj'
import { PlantType } from './plant'
export default new GraphQLSchema({
	//types is required to list all possible class implementing interface, maybe for better validating
	types:[PlantType,SPFObjType],
	query: new GraphQLObjectType({
		name: 'RootQueryType',
		fields: {
			spfobj: {
				type: SPFObjType,
        args:{
          id:{
            type: GraphQLString,
            defaultValue:'002OOOA'
          }
        },
				resolve(parent,{id},context) {
					return SPFObj.gen(context,id )
						.then((data) => {
							return data;
						});
				},
			}
		}
	})
});