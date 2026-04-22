class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None


def build_tree(arr):
    if not arr or arr[0] == "null":
        return None

    nodes = [None if x == "null" else TreeNode(int(x)) for x in arr]

    i = 1
    for j in range(len(nodes)):
        if nodes[j] is not None:
            if i < len(nodes):
                nodes[j].left = nodes[i]
                i += 1
            if i < len(nodes):
                nodes[j].right = nodes[i]
                i += 1

    return nodes[0]


def maxPathSum(root):
    max_sum = float("-inf")

    def dfs(node):
        nonlocal max_sum
        if not node:
            return 0

        left = max(dfs(node.left), 0)
        right = max(dfs(node.right), 0)

        # path through node
        max_sum = max(max_sum, node.val + left + right)

        # return best single path
        return node.val + max(left, right)

    dfs(root)
    return max_sum


# input
arr = input().split()
root = build_tree(arr)
print(maxPathSum(root))