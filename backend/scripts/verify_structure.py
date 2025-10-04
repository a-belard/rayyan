#!/usr/bin/env python3
"""
Simple verification to check file structure and import statements.
This doesn't actually import the modules (to avoid dependency issues).
"""

from pathlib import Path
import re

def check_file_exists(filepath, description):
    """Check if a file exists."""
    path = Path(filepath)
    if path.exists():
        print(f"  ✅ {description}: {path.name}")
        return True
    else:
        print(f"  ❌ {description}: {path.name} NOT FOUND")
        return False

def check_imports_in_file(filepath, expected_imports):
    """Check if expected imports are in file."""
    path = Path(filepath)
    if not path.exists():
        return False
    
    content = path.read_text()
    all_found = True
    
    for imp in expected_imports:
        if imp in content:
            print(f"    ✅ Has: {imp}")
        else:
            print(f"    ❌ Missing: {imp}")
            all_found = False
    
    return all_found

def main():
    print("=" * 60)
    print("Backend File Structure Verification")
    print("=" * 60)
    
    backend_dir = Path(__file__).parent
    
    # Check model files
    print("\n1. Checking Model Files:")
    model_files = [
        "src/models/user.py",
        "src/models/farm.py", 
        "src/models/thread.py",
        "src/models/message.py",
        "src/models/run.py",
        "src/models/common.py",
        "src/models/__init__.py"
    ]
    
    models_ok = all(check_file_exists(backend_dir / f, f.split('/')[-1]) for f in model_files)
    
    # Check schema files
    print("\n2. Checking Schema Files:")
    schema_files = [
        "src/schemas/user.py",
        "src/schemas/farm.py",
        "src/schemas/thread.py",
        "src/schemas/common.py",
        "src/schemas/__init__.py"
    ]
    
    schemas_ok = all(check_file_exists(backend_dir / f, f.split('/')[-1]) for f in schema_files)
    
    # Check backups
    print("\n3. Checking Backup Files:")
    backup_files = [
        "src/models/base.py.bak",
        "src/schemas/base.py.bak"
    ]
    
    backups_ok = all(check_file_exists(backend_dir / f, f.split('/')[-1]) for f in backup_files)
    
    # Check models __init__.py
    print("\n4. Checking src/models/__init__.py imports:")
    check_imports_in_file(
        backend_dir / "src/models/__init__.py",
        [
            "from src.models.user import User, UserRole",
            "from src.models.farm import Farm",
            "from src.models.thread import Thread",
            "from src.models.message import Message, MessageRole",
            "from src.models.run import Run, RunStatus"
        ]
    )
    
    # Check schemas __init__.py
    print("\n5. Checking src/schemas/__init__.py imports:")
    check_imports_in_file(
        backend_dir / "src/schemas/__init__.py",
        [
            "from src.schemas.user import",
            "from src.schemas.farm import",
            "from src.schemas.thread import",
            "from src.schemas.common import"
        ]
    )
    
    # Check key model classes
    print("\n6. Checking Model Class Definitions:")
    classes_to_check = [
        ("src/models/user.py", "class User(Base):"),
        ("src/models/farm.py", "class Farm(Base):"),
        ("src/models/thread.py", "class Thread(Base):"),
        ("src/models/message.py", "class Message(Base):"),
        ("src/models/run.py", "class Run(Base):"),
    ]
    
    for filepath, class_def in classes_to_check:
        path = backend_dir / filepath
        if path.exists():
            content = path.read_text()
            if class_def in content:
                print(f"  ✅ {filepath.split('/')[-1]}: {class_def}")
            else:
                print(f"  ❌ {filepath.split('/')[-1]}: {class_def} NOT FOUND")
    
    # Check enums
    print("\n7. Checking Enum Definitions:")
    enums_to_check = [
        ("src/models/user.py", "class UserRole(str, enum.Enum):"),
        ("src/models/message.py", "class MessageRole(str, enum.Enum):"),
        ("src/models/run.py", "class RunStatus(str, enum.Enum):"),
    ]
    
    for filepath, enum_def in enums_to_check:
        path = backend_dir / filepath
        if path.exists():
            content = path.read_text()
            if enum_def in content:
                print(f"  ✅ {filepath.split('/')[-1]}: {enum_def}")
            else:
                print(f"  ❌ {filepath.split('/')[-1]}: {enum_def} NOT FOUND")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Model Files:........................ {'✅ OK' if models_ok else '❌ FAIL'}")
    print(f"Schema Files:....................... {'✅ OK' if schemas_ok else '❌ FAIL'}")
    print(f"Backup Files:....................... {'✅ OK' if backups_ok else '❌ FAIL'}")
    print("=" * 60)
    
    print("\n📊 File Statistics:")
    for model_file in model_files:
        path = backend_dir / model_file
        if path.exists():
            lines = len(path.read_text().splitlines())
            print(f"  {path.name:20} {lines:4} lines")
    
    print("\n  Schema files:")
    for schema_file in schema_files:
        path = backend_dir / schema_file
        if path.exists():
            lines = len(path.read_text().splitlines())
            print(f"  {path.name:20} {lines:4} lines")
    
    print("\n✅ File structure verification complete!")
    print("\nNext steps:")
    print("  1. Test imports with: python -c 'from src.models import User; print(User)'")
    print("  2. Run the backend: python -m src.main")
    print("  3. Test API endpoints")
    print("  4. If everything works, delete .bak files")

if __name__ == "__main__":
    main()
