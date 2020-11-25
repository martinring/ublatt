modules = {}

include = pandoc.MetaList({})

local function check(el)
    for k,v in pairs(modules) do
        if el.classes:includes(k) then 
            if not include:includes(k) then
                include:insert(k)
            end
            for _,m in pairs(v) do
                n = k .. '/' .. m
                if el.classes:includes(m) and not include:includes(n) then
                    include:insert(n)
                end
            end
        end
    end
end 

extract = {
    CodeBlock = check,
    Div = check,
    Span = check,
    Code = check
  }

function Pandoc(el)    
    el.meta['include'] = include
    home = el.meta['ublatt_home'] or "."

    for file in io.popen("find " .. home .. "/dist/modules -type f -name '*.js' -d 1",'r'):lines() do
        x = string.gsub(file,"^.*dist/modules/(.*).js$","%1")
        modules[x] = {}
        for file in io.popen("find " .. home .. "/dist/modules/" .. x .. " -type f -name '*.js' -d 1 2> /dev/null","r"):lines() do
            y = string.gsub(file,"^.*dist/modules/" .. x .. "/(.*).js$","%1")
            table.insert(modules[x],y)
        end
    end

    pandoc.walk_block(pandoc.Div(el.blocks), extract)        

    el.meta['css'] = pandoc.MetaList({"ublatt.css"})
    for y,x in pairs(include) do
      if os.execute("test -f " .. home .. "/dist/modules/" .. x .. ".css") then
        table.insert(el.meta['css'],'modules/' .. x .. '.css')
      end
    end

    return pandoc.Pandoc(el.blocks,el.meta)
end