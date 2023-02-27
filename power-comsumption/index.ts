import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import run from './collector'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.')

  const result = await run()

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: result
  }
}

export default httpTrigger
