import axios, { AxiosError } from "axios"

const RequestMethods = {
    GET: "get",
    POST: "post",
    PATCH: "patch",
    PUT: "put",
    DELETE: "delete"
} as const

type RequestMethods = keyof typeof RequestMethods

interface BaseApiProps {
    method: RequestMethods,
    url: string,
    params?: {
        [key: string]: any
    },
}

export const makeApiCalls = async ({
    url,
    params,
    method
}: BaseApiProps) => {

    return new Promise( async (resolve, reject) => {

        try {
            const res = await axios[RequestMethods[method]](
                url,
                params
            );
            resolve(res.data.data)
        } catch (error) {
            if (error instanceof AxiosError) {
                reject(error.response)
            }
        }

    })

}