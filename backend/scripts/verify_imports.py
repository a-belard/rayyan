#!/usr/bin/env python3
"""
Verification script to check that all imports work correctly after splitting.
Run this from the backend directory: python verify_imports.py
"""

import sys
from pathlib import Path

# Add backend to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

def test_model_imports():
    """Test that all model imports work correctly."""
    print("Testing model imports...")
    
    try:
        # Test individual imports
        from src.models.user import User, UserRole
        from src.models.farm import Farm
        from src.models.thread import Thread
        from src.models.message import Message, MessageRole
        from src.models.run import Run, RunStatus
        print("  ✅ Individual model imports successful")
        
        # Test package imports (through __init__.py)
        from src.models import User, UserRole, Farm, Thread, Message, MessageRole, Run, RunStatus
        print("  ✅ Package model imports successful")
        
        # Verify enums
        assert hasattr(UserRole, 'admin')
        assert hasattr(MessageRole, 'user')
        assert hasattr(RunStatus, 'pending')
        print("  ✅ Enum values accessible")
        
        return True
    except Exception as e:
        print(f"  ❌ Model import failed: {e}")
        return False


def test_schema_imports():
    """Test that all schema imports work correctly."""
    print("\nTesting schema imports...")
    
    try:
        # Test individual imports
        from src.schemas.user import UserCreate, UserResponse, PreferencesUpdate, UserStatsResponse
        from src.schemas.farm import FarmCreate, FarmResponse, FarmZone
        from src.schemas.thread import ThreadCreate, ThreadResponse
        from src.schemas.common import ErrorResponse
        print("  ✅ Individual schema imports successful")
        
        # Test package imports (through __init__.py)
        from src.schemas import (
            UserBase, UserCreate, UserUpdate, UserResponse,
            FarmBase, FarmCreate, FarmResponse, FarmZone,
            ThreadCreate, ThreadUpdate, ThreadResponse,
            PreferencesUpdate, UserStatsResponse, ErrorResponse
        )
        print("  ✅ Package schema imports successful")
        
        # Verify schema attributes
        assert hasattr(UserCreate, 'model_validate')
        assert hasattr(FarmZone, 'model_validate')
        print("  ✅ Schema methods accessible")
        
        return True
    except Exception as e:
        print(f"  ❌ Schema import failed: {e}")
        return False


def test_router_imports():
    """Test that routers can import what they need."""
    print("\nTesting router imports...")
    
    try:
        # These imports simulate what routers do
        from src.models import User, Farm, Thread, Message, Run
        from src.schemas import UserResponse, FarmResponse, ThreadResponse
        print("  ✅ Router imports successful")
        
        return True
    except Exception as e:
        print(f"  ❌ Router import failed: {e}")
        return False


def test_relationships():
    """Test that SQLAlchemy relationships are properly configured."""
    print("\nTesting model relationships...")
    
    try:
        from src.models import User, Farm, Thread, Message, Run
        
        # Check User relationships
        assert hasattr(User, 'threads')
        assert hasattr(User, 'farms')
        print("  ✅ User relationships defined")
        
        # Check Farm relationships
        assert hasattr(Farm, 'owner')
        print("  ✅ Farm relationships defined")
        
        # Check Thread relationships
        assert hasattr(Thread, 'user')
        assert hasattr(Thread, 'farm')
        assert hasattr(Thread, 'messages')
        assert hasattr(Thread, 'runs')
        print("  ✅ Thread relationships defined")
        
        # Check Message relationships
        assert hasattr(Message, 'thread')
        print("  ✅ Message relationships defined")
        
        # Check Run relationships
        assert hasattr(Run, 'thread')
        print("  ✅ Run relationships defined")
        
        return True
    except Exception as e:
        print(f"  ❌ Relationship check failed: {e}")
        return False


def main():
    """Run all verification tests."""
    print("=" * 60)
    print("Backend Model/Schema Split Verification")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Model Imports", test_model_imports()))
    results.append(("Schema Imports", test_schema_imports()))
    results.append(("Router Imports", test_router_imports()))
    results.append(("Model Relationships", test_relationships()))
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 All verification tests passed!")
        print("\nNext steps:")
        print("  1. Run the backend: python -m src.main")
        print("  2. Test the API endpoints")
        print("  3. If everything works, delete .bak files")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please review the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
