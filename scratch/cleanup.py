import re
import subprocess
import os

def run_tsc():
    print("Running npx tsc --noEmit...")
    result = subprocess.run(
        ["npx", "tsc", "--noEmit"],
        capture_output=True,
        text=True,
        shell=True
    )
    return result.stdout

def clean_file(filepath, line_num, varname, all_unused=False):
    if not os.path.exists(filepath):
        return False
        
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    if line_num - 1 >= len(lines):
        return False
        
    line = lines[line_num - 1]
    original = line
    
    if all_unused:
        # Comment out the entire import line
        line = f"// {line.strip()}\n"
    else:
        # Remove variable name from import curly braces or destructuring
        # 1. Matches varname followed by comma and optional spaces: 'varname,\s*'
        line = re.sub(rf'\b{varname}\s*,\s*', '', line)
        # 2. Matches comma and optional spaces followed by varname: ',\s*varname\b'
        line = re.sub(rf'\s*,\s*\b{varname}\b', '', line)
        # 3. Matches varname in braces: '{\s*varname\s*}'
        line = re.sub(rf'{{\s*\b{varname}\b\s*}}', '{}', line)
        # 4. Matches varname in imports/decl: '\bvarname\b'
        # Only replace if it doesn't break other things, e.g. if it's a stand-alone variable in import
        if varname in line:
            # check if it is part of destructuring const [x, setX]
            line = re.sub(rf'\b{varname}\b', '_', line) # prefix with underscore
            
    if line != original:
        lines[line_num - 1] = line
        with open(filepath, "w", encoding="utf-8") as f:
            f.writelines(lines)
        print(f"Cleaned {filepath}:{line_num} - removed '{varname}'")
        return True
    return False

def main():
    # Loop to run tsc and clean until no errors remain
    for iteration in range(5):
        print(f"--- Iteration {iteration + 1} ---")
        output = run_tsc()
        errors = re.findall(r"([^(]+)\((\d+),\d+\): error TS(6133|6192): (.*)", output)
        
        if not errors:
            print("No unused variables or imports found!")
            break
            
        cleaned_any = False
        for filepath, line_str, err_code, msg in errors:
            filepath = filepath.strip()
            line_num = int(line_str)
            
            # Find variable name in single quotes
            var_match = re.search(r"'([^']+)'", msg)
            varname = var_match.group(1) if var_match else ""
            
            all_unused = (err_code == "6192")
            
            if all_unused or varname:
                if clean_file(filepath, line_num, varname, all_unused):
                    cleaned_any = True
                    
        if not cleaned_any:
            print("No progress could be made automatically, stopping.")
            break

if __name__ == "__main__":
    main()
