import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInterfaceType,GraphQLNonNull} from 'graphql'
import { SPFObj } from '../model'
import { SPFObjType } from './spfobj'
import { SimpleObjectType } from './simpleObjectType'
export default new GraphQLSchema({
	//types is required to list all possible class implementing interface, maybe for better validating
	types:[SimpleObjectType,SPFObjType],
	query: new GraphQLObjectType({
		name: 'RootQueryType',
		fields: {
			spfobj: {
				type: SPFObjType,
        args:{
          id:{
            type: new GraphQLNonNull(GraphQLString),
            //defaultValue:'002OOOA'
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