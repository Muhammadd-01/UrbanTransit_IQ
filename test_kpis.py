import asyncio
from backend.app.api.dashboard import get_kpis

async def test():
    res = await get_kpis()
    print(res.dict())

asyncio.run(test())
