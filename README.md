# Todo/Issues.

### The current approach involves passing the name of a directory to the chatbot in a specified format

##### The format looks like this - 
``` ts
    @bot <action> <path>
```

- However the above apporoach is limited to a sub-directory simply because LLM larger token size would mean higher cost.

## In Future there are a few approaches, which I read about 
- Clone the repo, creat a vector db for it and query. But cloning would mean that repo should be public so that looks like a limitation.
- Another apporach would be to go through sub directories and document each of them individually. Then finally append all of them together to parent directory.
- Third would be to keep docs for each sub dir seperate, a common practice in large code bases. 
