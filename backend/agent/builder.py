"""
Agent builder using LangGraph to create the agricultural advisory agent.
"""

from langgraph.prebuilt import create_react_agent
from agent.llm_config import get_llm
from agent.tools import create_agricultural_tools
from agent.system_prompt import get_system_prompt


def build_agricultural_agent(llm_provider: str | None = None, llm_model: str | None = None):
    """
    Build the agricultural advisory agent with configured LLM and tools.
    
    Args:
        llm_provider: Optional LLM provider override
        llm_model: Optional model name override
    
    Returns:
        Configured LangGraph agent
    """
    llm = get_llm(provider=llm_provider, model=llm_model)
    tools = create_agricultural_tools()
    system_prompt = get_system_prompt()
    
    # Create ReAct agent with tools
    # System prompt will be prepended to messages in the agent router
    agent = create_react_agent(
        model=llm,
        tools=tools,
    )
    
    return agent


__all__ = ["build_agricultural_agent"]
