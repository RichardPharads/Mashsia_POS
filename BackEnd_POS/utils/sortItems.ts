type sortType<T> = {
    data: T[],
    prefix?: string,
    property?: keyof T
}

function sortItems <T extends Record <string , any>>({
    data,
    prefix = "COF",
    property = "productId" as keyof T
}: sortType<T>): T[] {
    if(!Array.isArray(data)) return [];
    return [...data].sort((a,b) => {
        const aIsPrio = a[property]?.startsWith(prefix) ? 0 : 1;
        const bIsPrio = a[property]?.startsWith(prefix) ? 0 : 1;
        return aIsPrio - bIsPrio;
    })
}