from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import re


# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

def validate_expression(expression):
    # Basic validation to ensure the expression is well-formed
    if not expression or not isinstance(expression, str):
        raise ValueError("Expression must be a non-empty string.")
    if '(' not in expression or ')' not in expression:
        raise ValueError("Expression must contain parentheses to denote functions.")
    if expression.count('(') != expression.count(')'):
        raise ValueError("Mismatched parentheses in the expression.")

def is_higher_order(term):
    # Check if the term represents a higher-order function (e.g., a function as an argument)
    return '(' in term and ')' in term and ',' in term

def unify_higher_order(term1, term2, substitutions):
    # Unify higher-order terms by recursively unifying their arguments
    if term1 == term2:
        return substitutions

    if '(' in term1 and '(' in term2:
        func1, args1 = term1.split('(', 1)
        func2, args2 = term2.split('(', 1)

        if func1 != func2:
            raise Exception(f"Cannot unify functions {func1} and {func2}")

        args1 = args1.rstrip(')').split(',')
        args2 = args2.rstrip(')').split(',')

        if len(args1) != len(args2):
            raise Exception("Function arguments do not match in length")

        for a1, a2 in zip(args1, args2):
            substitutions = unify(a1.strip(), a2.strip(), substitutions)

        return substitutions

    raise Exception(f"Cannot unify higher-order terms {term1} and {term2}")

def is_variable(term):
    return isinstance(term, str) and term.islower()

def is_function_or_constant(term):
    return isinstance(term, str) and not term.islower()

def unify(term1, term2, substitutions):
    if term1 == term2:
        return substitutions
    elif is_variable(term1):
        return unify_variable(term1, term2, substitutions)
    elif is_variable(term2):
        return unify_variable(term2, term1, substitutions)
    elif is_function_or_constant(term1) and is_function_or_constant(term2):
        if term1 == term2:
            return substitutions
        else:
            raise Exception(f"Cannot unify {term1} with {term2}")
    raise Exception(f"Cannot unify {term1} with {term2}")

def unify_variable(variable, term, substitutions):
    if variable in substitutions:
        return unify(substitutions[variable], term, substitutions)
    else:
        substitutions[variable] = term
        return substitutions

def plotkin_algorithm(expr1, expr2, logic_type):
    validate_expression(expr1)
    validate_expression(expr2)

    if logic_type == "second-order":
        def abstract_predicates(term1, term2):
            if term1 != term2:
                return "R"
            return term1

        def handle_quantifiers(expr1, expr2):
            if expr1.startswith("∀") and expr2.startswith("∀"):
                variable1 = expr1[1:expr1.index('.')]
                variable2 = expr2[1:expr2.index('.')]
                if variable1 != variable2:
                    generalized_variable = "x"
                else:
                    generalized_variable = variable1

                body1 = expr1[expr1.index('.') + 1:]
                body2 = expr2[expr2.index('.') + 1:]
                generalized_body = plotkin_algorithm(body1, body2, logic_type)

                return f"∀{generalized_variable}.{generalized_body}"

            return None

        quantifier_result = handle_quantifiers(expr1, expr2)
        if quantifier_result:
            return quantifier_result

        terms1 = expr1.replace('(', ' ').replace(')', ' ').replace(',', ' ').split()
        terms2 = expr2.replace('(', ' ').replace(')', ' ').replace(',', ' ').split()

        generalized_terms = []
        for t1, t2 in zip(terms1, terms2):
            if t1 != t2:
                generalized_terms.append("-")
            elif t1.startswith("P") and t2.startswith("Q"):
                generalized_terms.append("R")  # Generalize predicate when predicates differ
            elif t1 == t2:
                generalized_terms.append(t1)
            else:
                generalized_terms.append("-")

        generalized_expression = 'P(' + ', '.join(generalized_terms) + ')'
        return generalized_expression

    # Parse terms by splitting on commas while preserving nested structures
    def parse_expression(expression):
        stack = []
        term = ""
        parsed_terms = []

        for char in expression:
            if char == '(':
                stack.append(char)
            elif char == ')':
                stack.pop()

            term += char

            if char == ',' and not stack:
                parsed_terms.append(term.strip(', '))
                term = ""

        if term:
            parsed_terms.append(term.strip(', '))

        return parsed_terms

    terms1 = parse_expression(expr1[2:-1])  # Remove outer 'P(' and ')' for parsing
    terms2 = parse_expression(expr2[2:-1])

    if len(terms1) != len(terms2):
        raise ValueError("Expressions must have the same number of terms for generalization.")

    generalized_terms = []
    for t1, t2 in zip(terms1, terms2):
        if t1 == t2:
            generalized_terms.append(t1)
        else:
            generalized_terms.append('-')

    # Reconstruct the generalized expression
    generalized_expression = 'P(' + ', '.join(generalized_terms) + ')'
    return generalized_expression

def parse_terms(expression):
    # Parse the terms in the expression, ensuring proper handling of parentheses
    stack = []
    term = ""
    terms = []

    for char in expression:
        if char == '(':
            stack.append(char)
        elif char == ')':
            if stack:
                stack.pop()
        
        term += char

        if not stack and char == ' ':
            terms.append(term.strip())
            term = ""

    if term:
        terms.append(term.strip())

    if stack:
        raise ValueError("Mismatched parentheses in the expression.")

    return terms

def improved_generalize_logic(expr1, expr2):
    # Extract predicates
    predicate1 = expr1.split('(')[0]
    predicate2 = expr2.split('(')[0]

    # Check if the predicates are the same; if not, generalize to a new predicate
    if predicate1 != predicate2:
        generalized_predicate = "R"  # Use a new generalized predicate if the predicates differ
    else:
        generalized_predicate = predicate1  # Keep the same predicate if they match

    # Extract terms by slicing out the parentheses and splitting by commas
    terms1 = expr1[expr1.index('(') + 1:expr1.rindex(')')].split(',')
    terms2 = expr2[expr2.index('(') + 1:expr2.rindex(')')].split(',')

    # Ensure the number of terms matches in both expressions
    if len(terms1) != len(terms2):
        raise ValueError("Input expressions must have the same number of arguments.")

    # Generalize terms based on their corresponding positions
    generalized_terms = []
    for t1, t2 in zip(terms1, terms2):
        generalized_terms.append(f"{t1.strip()}:{t2.strip()}")  # Generalize terms as pairs

    # Rebuild the generalized expression
    generalized_expression = f"{generalized_predicate}({', '.join(generalized_terms)})"
    return generalized_expression


def second_order_generalize(expr1, expr2):
    var_counter = [1]  # Use list to allow mutation in nested scope
    mappings = {}

    # Main recursive function
    def generalize(e1, e2):
        # Handle full quantifiers (e.g., ∀x.Likes(x, y))
        if e1.startswith(("∀", "∃")) and e2.startswith(("∀", "∃")):
            q1, q2 = e1[0], e2[0]
            if q1 != q2:
                generalized_q = "Q"
            else:
                generalized_q = q1

            var1, body1 = e1[1:].split('.', 1)
            var2, body2 = e2[1:].split('.', 1)

            gen_var = f"V{var_counter[0]}"
            var_counter[0] += 1
            mappings[gen_var] = (var1.strip(), var2.strip())

            gen_body = generalize(body1.strip(), body2.strip())
            return f"{generalized_q}{gen_var}.{gen_body}"

        # Handle predicate expressions like Likes(John, x)
        if '(' in e1 and '(' in e2:
            pred1, args1 = extract_predicate_and_args(e1)
            pred2, args2 = extract_predicate_and_args(e2)

            generalized_pred = pred1 if pred1 == pred2 else "P"
            

            generalized_args = []
            for a1, a2 in zip(args1, args2):
                if a1 == a2:
                    generalized_args.append(a1)
                elif is_complex(a1) and is_complex(a2):
                    gen = generalize(a1, a2)
                    generalized_args.append(gen)
                else:
                    gen_var = f"V{var_counter[0]}"
                    var_counter[0] += 1
                    mappings[gen_var] = (a1, a2)
                    generalized_args.append(gen_var)

            return f"{generalized_pred}({', '.join(generalized_args)})"

        # Base case: different atomic expressions
        if e1 == e2:
            return e1
        else:
            gen_var = f"V{var_counter[0]}"
            var_counter[0] += 1
            mappings[gen_var] = (e1, e2)
            return gen_var

    def extract_predicate_and_args(expr):
        pred = expr[:expr.index('(')].strip()
        args = balanced_split(expr[expr.index('(') + 1:-1])
        return pred, [arg.strip() for arg in args]

    def is_complex(s):
        return '(' in s and ')' in s

    def balanced_split(args_str):
        """Split arguments accounting for nested parentheses"""
        result = []
        depth = 0
        current = ''
        for ch in args_str:
            if ch == ',' and depth == 0:
                result.append(current.strip())
                current = ''
            else:
                if ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                current += ch
        if current:
            result.append(current.strip())
        return result

    # Perform generalization
    generalized_expr = generalize(expr1.strip(), expr2.strip())
    return generalized_expr, mappings

@app.route("/plotkin-generalize", methods=["POST"])
def plotkin_generalize():
    data = request.json
    expr1 = data.get("expression1", "")
    expr2 = data.get("expression2", "")
    logic_type = data.get("logic_type", "first-order")

    logging.debug(f"Received request for Plotkin generalization: expr1={expr1}, expr2={expr2}, logic_type={logic_type}")

    try:
        if logic_type == "second-order" or (logic_type == "first-order" and expr1.split('(')[0] != expr2.split('(')[0]):
            return jsonify({
                "error": "Plotkin’s LGG doesn’t generalize over predicate symbols, higher-order functions, or quantifiers effectively. It also doesn’t support lambda abstractions or higher-order terms.",
                "limitations": [
                    "Predicate Variables: Plotkin’s LGG doesn’t generalize over predicate symbols (e.g., generalizing P(x) and Q(x)).",
                    "Function Variables: Higher-order functions aren’t unified since LGG doesn’t abstract over function terms.",
                    "Quantifiers: Plotkin doesn’t manipulate or generalize ∀ (for all) or ∃ (there exists) quantifiers effectively.",
                    "Structural Complexity: It doesn't natively support lambda abstractions or higher-order terms."
                ]
            }), 400

        substitutions = plotkin_algorithm(expr1, expr2, logic_type)
        logging.debug(f"Plotkin generalization result: {substitutions}")
        return jsonify(
             substitutions,
             "Plotkin's LGG successfully generalized the input expressions. Note that it only supports first-order logic and identical predicates because both expressions are syntactically identical, the LGG is just the same expression. Plotkin’s LGG finds the most specific generalization that covers both inputs, and in this case, since they are the same, that generalization is the expression itself."
        )
    except Exception as e:
        logging.error(f"Error during Plotkin generalization: {str(e)}")
        return jsonify({"error": f"Failed to generalize expressions: {str(e)}"}), 400

@app.route("/improved-generalize", methods=["POST"])
def improved_generalize():
    data = request.json
    expr1 = data.get("expression1", "")
    expr2 = data.get("expression2", "")
    logic_type = data.get("logic_type", "first-order")

    try:
        if logic_type == "first-order":
            substitutions = improved_generalize_logic(expr1, expr2)
            improved_result = {
                "generalization": substitutions,
                "logic_type": logic_type,
                "message": "Improved generalization was performed by refining the mapping of terms in first-order logic. The algorithm dynamically identified differences between the input expressions and replaced them with placeholders (-) while retaining identical structures."
            }
        elif logic_type == "second-order":
            generalized_expression = second_order_generalize(expr1, expr2)
            improved_result = {
                "generalization": generalized_expression,
                "message": "The second_order_generalize function recursively compares two logical expressions, handling quantifiers and predicates. It replaces differing parts—whether variables, predicates, or arguments—with fresh generalized variables (like V1, V2), while keeping track of which original terms each variable represents. For quantifiers, it standardizes bound variables and generalizes their bodies recursively. For predicates, if the names differ, it uses a generic symbol, then generalizes each argument. The result is a generalized expression capturing the common structure of both inputs, along with a mapping showing how variables correspond to original parts."
            }
        else:
            raise ValueError("Unsupported logic type.")

        return jsonify(improved_result)
    except Exception as e:
        logging.error(f"Error during improved generalization: {str(e)}")
        return jsonify({"error": f"Failed to generalize expressions: {str(e)}"}), 400

if __name__ == "__main__":
    app.run(port=5000, debug=True)