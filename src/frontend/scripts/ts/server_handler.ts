// verify if the code is beeing runned localy or in a server
export async function is_local(): Promise<boolean>
{
    const url = new URL('/is_running', import.meta.url).href;
    // this is so ugly...
    try {
        await fetch(url);
        return true;
    } catch {
        return false;
    }
};

// merge this function with the above
type Either<T, E> = number | Error;

export async function get_server_port(): Promise<Either<number, Error>>
{
    if (!await is_local()) {
        return new Error("no server detected!")
    }
    const url = new URL('/is_running', import.meta.url).href;
    let port: number = 0;
    //
    await fetch(url).then(r => port = r.json()[1])
    return port
}