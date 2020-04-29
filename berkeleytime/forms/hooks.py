import requests

from utils import get_config_dict


def create_formatted_message(response):
    config = get_config_dict(response["Config"])

    question_mapping = {}
    for count, question in enumerate(config["questions"], 1):
        question_mapping[question["title"]] = "Question " + str(count)

    items = []
    for question in config["questions"]:
        if question_mapping[question["title"]] in response:
            items.append("<strong>{}</strong>\n{}".format(question["title"], response[question_mapping[question["title"]]]))

    return "\n\n".join(items)


def auto_github_issue(response, hook_config):

    ghToken = "***REMOVED***"
    ghURL = "https://api.github.com/repos/asuc-octo/berkeleytime/issues?access_token="

    payload = {
        "title": response[hook_config["title"]] if hook_config["title"] in response else hook_config["title"],
        "body": create_formatted_message(response)
    }

    requests.post(ghURL+ghToken, json=payload)


HOOKS = [auto_github_issue]

HOOKS_MAP = {f.__name__ : f for f in HOOKS}


def dispatch_hooks(response):
    config = get_config_dict(response["Config"])
    if "hooks" not in config["info"]:
        return

    for hook_config in config["info"]["hooks"]:
        if hook_config["name"] in HOOKS_MAP:
            HOOKS_MAP[hook_config["name"]](response, hook_config)
        else:
            print("No hook with the name {} found. Available hooks: {}".format(hook_config["name"], HOOKS_MAP.keys()))


