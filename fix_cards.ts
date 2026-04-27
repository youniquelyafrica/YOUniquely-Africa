import * as fs from "fs";

let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="absolute inset-x-0 bottom-0 h-2\/3 bg-gradient-to-t from-black\/80 via-black\/40 to-transparent z-10" \/>\s*<div className="relative z-20">\s*<h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-2">(.*?)<\/h3>\s*<p className="text-white\/90 font-light text-sm md:text-base leading-relaxed">(.*?)<\/p>\s*<\/div>/g;

const replacement = `<div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500 z-10" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 transition-all duration-500 group-hover:h-full group-hover:from-black/90 group-hover:via-black/60" />
              <div className="relative z-20 flex flex-col justify-end">
                <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-0 group-hover:mb-2 transition-all duration-500">$1</h3>
                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                  <div className="overflow-hidden">
                    <p className="text-white/90 font-light text-sm md:text-base leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 mt-2">$2</p>
                  </div>
                </div>
              </div>`;

const newCode = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', newCode);
console.log("Replaced cards successfully.");
