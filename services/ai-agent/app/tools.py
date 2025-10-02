"""
Agent Tools - Functions the AI can call
"""

from typing import Dict, Any, List


class ResearchTools:
    """
    Tools available to the research agent

    Each tool is a Python function the LLM can call to:
    - Retrieve data
    - Perform calculations
    - Validate structures
    - Suggest improvements
    """

    @staticmethod
    def analyze_banner_structure(banners: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate banner structure and equations

        Checks:
        - Equation syntax (e.g., S7=2, Q1>5)
        - Completeness (all H1s have H2s)
        - Naming consistency
        """

        issues = []
        warnings = []
        stats = {
            "total_h1": 0,
            "total_h2": 0,
            "equations_validated": 0,
            "syntax_errors": 0
        }

        for banner in banners:
            h1_label = banner.get("h1_label")
            h2_categories = banner.get("h2_categories", [])

            stats["total_h1"] += 1
            stats["total_h2"] += len(h2_categories)

            # Check H1 has at least one H2
            if not h2_categories:
                issues.append(f"H1 '{h1_label}' has no H2 categories")

            # Validate each H2 equation
            for h2 in h2_categories:
                equation = h2.get("equation", "")
                label = h2.get("label", "")

                if not equation:
                    issues.append(f"H2 '{label}' in '{h1_label}' missing equation")
                    continue

                # Validate equation syntax
                validation = ResearchTools._validate_equation(equation)

                if validation["valid"]:
                    stats["equations_validated"] += 1
                else:
                    stats["syntax_errors"] += 1
                    issues.append(
                        f"Invalid equation '{equation}' in '{label}': {validation['error']}"
                    )

                # Check for naming consistency
                if not label:
                    warnings.append(f"H2 in '{h1_label}' with equation '{equation}' has no label")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "stats": stats,
            "recommendations": ResearchTools._banner_recommendations(stats, issues)
        }


    @staticmethod
    def _validate_equation(equation: str) -> Dict[str, Any]:
        """
        Validate banner equation syntax

        Supported formats:
        - S7=2 (single value)
        - S1=18-27 (range)
        - Q1=1,2,3 (multiple values)
        - Q5>10 (inequality)
        - Q5<=5 (inequality with equals)
        """

        import re

        # Pattern: QuestionID Operator Value(s)
        patterns = [
            r'^[A-Z]+[0-9]+=[0-9]+$',                    # S7=2
            r'^[A-Z]+[0-9]+=[0-9]+-[0-9]+$',             # S1=18-27
            r'^[A-Z]+[0-9]+=[0-9]+(,[0-9]+)*$',          # Q1=1,2,3
            r'^[A-Z]+[0-9]+[><=]+[0-9]+(\.[0-9]+)?$',    # Q5>10 or Q5<=5
        ]

        for pattern in patterns:
            if re.match(pattern, equation.strip()):
                return {"valid": True, "error": None}

        return {
            "valid": False,
            "error": "Invalid format. Expected: Q1=1, Q1=1-10, Q1=1,2,3, or Q1>5"
        }


    @staticmethod
    def _banner_recommendations(stats: Dict, issues: List[str]) -> List[str]:
        """Generate recommendations based on banner analysis"""

        recommendations = []

        if stats["total_h1"] == 0:
            recommendations.append("Start by adding H1 categories (major demographic splits)")

        if stats["total_h1"] > 15:
            recommendations.append(
                "Consider reducing H1 count. More than 15 banners can make tables difficult to read."
            )

        if stats["syntax_errors"] > 0:
            recommendations.append(
                f"Fix {stats['syntax_errors']} equation syntax errors before proceeding"
            )

        if stats["total_h2"] < stats["total_h1"] * 2:
            recommendations.append(
                "Most H1 categories should have 2+ H2 subcategories for meaningful analysis"
            )

        return recommendations


    @staticmethod
    def validate_questionnaire(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate questionnaire structure and identify issues

        Checks:
        - Missing question text
        - Questions with no options (where required)
        - Unreferenced conditional logic
        - Scale consistency
        - Termination logic issues
        """

        issues = []
        warnings = []

        for i, q in enumerate(questions):
            qid = q.get("question_id", f"Q{i+1}")
            qtext = q.get("question_text", "")
            qtype = q.get("question_type", "")
            qmode = q.get("question_mode", "")

            # Check for missing text
            if not qtext or qtext.strip() == "":
                issues.append(f"{qid}: Missing question text")

            # Check for missing options (where needed)
            if qmode in ["list", "table"] and not q.get("options"):
                issues.append(f"{qid}: No options defined for {qmode} question")

            # Check conditional logic references
            conditions = q.get("conditions", {})
            if conditions:
                for cond in conditions.get("conditions", []):
                    source_qid = cond.get("source_question")
                    # Verify source question exists
                    if source_qid not in [qu.get("question_id") for qu in questions]:
                        warnings.append(
                            f"{qid}: Conditional logic references non-existent question '{source_qid}'"
                        )

            # Check scale consistency
            if qmode == "scale" and q.get("scale_config"):
                scale_points = q["scale_config"].get("points", 0)
                if scale_points < 2:
                    issues.append(f"{qid}: Scale must have at least 2 points")
                elif scale_points > 11:
                    warnings.append(
                        f"{qid}: {scale_points}-point scale may be too granular. Consider 5, 7, or 10 points."
                    )

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "recommendations": ResearchTools._questionnaire_recommendations(questions, issues)
        }


    @staticmethod
    def _questionnaire_recommendations(questions: List[Dict], issues: List[str]) -> List[str]:
        """Generate questionnaire design recommendations"""

        recommendations = []

        # Check questionnaire length
        if len(questions) > 50:
            recommendations.append(
                f"Questionnaire has {len(questions)} questions. Consider reducing length to improve completion rates."
            )

        # Check for variety in question types
        question_modes = [q.get("question_mode") for q in questions]
        unique_modes = set(question_modes)

        if len(unique_modes) == 1:
            recommendations.append(
                "Consider varying question types (scale, grid, open-ended) to maintain respondent engagement"
            )

        # Check for screeners
        has_screener = any(q.get("termination_logic") for q in questions)
        if not has_screener and len(questions) > 10:
            recommendations.append(
                "Consider adding screening questions to ensure you're reaching your target audience"
            )

        return recommendations


    @staticmethod
    def suggest_banner_categories(questions: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Suggest banner categories based on questionnaire questions

        Returns list of recommended H1 banners with sample H2 equations
        """

        suggestions = []

        # Look for demographic questions
        for q in questions:
            qid = q.get("question_id", "")
            qtext = q.get("question_text", "").lower()

            # Age
            if "age" in qtext or qid.lower() == "s1":
                suggestions.append({
                    "h1_label": "Age Groups",
                    "source_question": qid,
                    "sample_h2": f"{qid}=18-34, {qid}=35-54, {qid}=55+"
                })

            # Gender
            if "gender" in qtext or qid.lower() == "s2":
                suggestions.append({
                    "h1_label": "Gender",
                    "source_question": qid,
                    "sample_h2": f"{qid}=1 (Male), {qid}=2 (Female)"
                })

            # Region/Geography
            if "region" in qtext or "state" in qtext or "country" in qtext:
                suggestions.append({
                    "h1_label": "Geography",
                    "source_question": qid,
                    "sample_h2": f"{qid}=1 (Northeast), {qid}=2 (South), ..."
                })

            # Usage/Frequency
            if "use" in qtext or "frequency" in qtext:
                suggestions.append({
                    "h1_label": "Usage Frequency",
                    "source_question": qid,
                    "sample_h2": f"{qid}=1 (Heavy Users), {qid}=2,3 (Light Users)"
                })

        return suggestions
